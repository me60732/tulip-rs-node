/**
 * Shared utilities for tulip-rs-node-bench.
 *
 * Loaded by every bench_*.js indicator file and by run_all.js.
 * dotenv reads .env from the current working directory — run npm scripts from
 * inside the bench/ directory so the .env file is picked up automatically.
 */

import { config } from "dotenv";
import pg from "pg";
import os from "os";

// Load .env from CWD (bench/ when running via npm scripts).
config();

const { Pool } = pg;

// ── Configuration ─────────────────────────────────────────────────────────────

// Accept either the bench-specific STOCKS_DATABASE_URL or the shared DATABASE_URL
// used by the Rust tulip_test .env so both can point at the same file.
const STOCKS_DB_URL =
  process.env.STOCKS_DATABASE_URL ??
  process.env.DATABASE_URL ??
  "postgresql://tulip:tulip@localhost:5432/stocks";

const BENCH_DB_URL =
  process.env.BENCHMARK_DATABASE_URL ??
  "postgresql://tulip:tulip@localhost:5432/indicator_benchmark";

const LOG_TO_DB = process.env.BENCHMARK_LOG_TO_DB === "1";
const BENCH_NUMBER = parseInt(process.env.BENCH_NUMBER ?? "10", 10);
const BENCH_REPEAT = parseInt(process.env.BENCH_REPEAT ?? "500", 10);
const BENCH_WARMUP = parseInt(process.env.BENCH_WARMUP ?? "50", 10);
const DATA_LIMIT = 6705; // same row-count as Rust benchmarks
const STOCKS = [
  ["BHP", "ASX"],
  ["CBA", "ASX"],
  ["AAPL", "NYSE"],
  ["MSFT", "NYSE"],
];

// ── Timing ────────────────────────────────────────────────────────────────────

/**
 * Time a zero-argument function and return nanosecond statistics.
 *
 * number = back-to-back calls per sample  (amortises per-call overhead)
 * repeat = independent samples            (source for mean/min/max/stddev)
 *
 * Returns { mean_ns, stddev_ns, min_ns, max_ns, sample_count }.
 */
function timeFn(
  fn,
  number = BENCH_NUMBER,
  repeat = BENCH_REPEAT,
  warmup = BENCH_WARMUP,
) {
  // Un-timed warm-up — lets the JIT compile hot paths and CPU caches stabilise
  // before any measurements are taken.  Defaults to BENCH_WARMUP (env var).
  for (let w = 0; w < warmup; w++) fn();

  const samples = [];
  for (let r = 0; r < repeat; r++) {
    const start = process.hrtime.bigint();
    for (let n = 0; n < number; n++) fn();
    const end = process.hrtime.bigint();
    // ns per call (BigInt → Number is safe here — values stay well below 2^53)
    samples.push(Number(end - start) / number);
  }
  const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
  const variance =
    samples.reduce((a, b) => a + (b - mean) ** 2, 0) / (samples.length - 1);
  return {
    mean_ns: Math.round(mean),
    stddev_ns: Math.round(Math.sqrt(variance)),
    min_ns: Math.round(Math.min(...samples)),
    max_ns: Math.round(Math.max(...samples)),
    sample_count: repeat,
  };
}

// ── Stock data loading ────────────────────────────────────────────────────────

/**
 * Fetch OHLCV rows from the stocks DB for all benchmark tickers.
 * Returns plain-JS-array objects ordered chronologically (oldest → newest),
 * consistent with the Rust benchmark data format.
 *
 * Shape: { symbol, open, high, low, close, volume, length }
 */
async function loadStockData() {
  const pool = new Pool({ connectionString: STOCKS_DB_URL });
  const query = `
    SELECT e.open, e.high, e.low, e.close, e.volume
    FROM listing l
    INNER JOIN adj_eod e ON l.listing_id = e.listing_id
    WHERE l.code = $1 AND l.exchange_code = $2 AND e.volume > 0
    ORDER BY e.ts ASC
    LIMIT $3
  `;
  const result = [];
  for (const [code, exchange] of STOCKS) {
    const { rows } = await pool.query(query, [code, exchange, DATA_LIMIT]);
    if (!rows.length) {
      console.error(`[warn] no data for ${code}/${exchange} — skipping`);
      continue;
    }
    result.push({
      symbol: `${code}_${exchange}`,
      open: Float64Array.from(rows, (r) => parseFloat(r.open)),
      high: Float64Array.from(rows, (r) => parseFloat(r.high)),
      low: Float64Array.from(rows, (r) => parseFloat(r.low)),
      close: Float64Array.from(rows, (r) => parseFloat(r.close)),
      volume: Float64Array.from(rows, (r) => parseFloat(r.volume)),
      length: rows.length,
    });
    console.log(
      `  loaded ${rows.length.toLocaleString()} bars  ${code}/${exchange}`,
    );
  }
  await pool.end();
  return result;
}

// ── Benchmark logger ──────────────────────────────────────────────────────────

/**
 * Writes timing results to the indicator_benchmark PostgreSQL database.
 *
 * Call order: new BenchmarkLogger() → init() → startRun() → log() × N → close()
 */
class BenchmarkLogger {
  constructor() {
    this.pool = new Pool({ connectionString: BENCH_DB_URL });
    this.runId = null;
    this._cache = {}; // indicator name → id
  }

  /** Populate the name→id cache from the indicators table. */
  async init() {
    const { rows } = await this.pool.query("SELECT id, name FROM indicators");
    for (const { id, name } of rows) this._cache[name] = id;
  }

  /** Create a new benchmark_runs row and store the returned id. */
  async startRun(
    notes = "Node.js benchmarks — tulip-rs-node vs technicalindicators",
  ) {
    const systemInfo = {
      os: process.platform,
      arch: process.arch,
      hostname: os.hostname(),
      node_version: process.version,
    };
    const { rows } = await this.pool.query(
      "INSERT INTO benchmark_runs (notes, system_info) VALUES ($1, $2) RETURNING id",
      [notes, JSON.stringify(systemInfo)],
    );
    this.runId = rows[0].id;
    console.log(`  benchmark run id: ${this.runId}`);
  }

  /**
   * Insert one result row.
   *
   * @param {object} p
   * @param {string}   p.indicatorName  — must match an entry in the indicators table
   * @param {string}   p.implType       — e.g. 'tulip_rs_node' | 'technicalindicators'
   * @param {number[]} p.options        — plain JS array, stored as JSON
   * @param {object}   p.timing         — { mean_ns, stddev_ns, min_ns, max_ns, sample_count }
   * @param {string}   p.symbol         — e.g. 'BHP_ASX'
   * @param {number}   p.inputSize      — number of bars
   */
  async log({ indicatorName, implType, options, timing, symbol, inputSize }) {
    const iid = this._cache[indicatorName];
    if (iid == null) {
      console.error(
        `[warn] '${indicatorName}' not in indicators table — skipping DB write`,
      );
      return;
    }
    await this.pool.query(
      `INSERT INTO benchmark_results
         (run_id, indicator_id, implementation_type, stock_symbol,
          data_source, options, mean_time_ns, std_dev_ns,
          min_time_ns, max_time_ns, sample_count, input_size)
       VALUES ($1,$2,$3,$4,'real_data',$5,$6,$7,$8,$9,$10,$11)`,
      [
        this.runId,
        iid,
        implType,
        symbol,
        JSON.stringify(options),
        timing.mean_ns,
        timing.stddev_ns,
        timing.min_ns,
        timing.max_ns,
        timing.sample_count,
        inputSize,
      ],
    );
  }

  async close() {
    await this.pool.end();
  }
}

// ── Stdout formatting ─────────────────────────────────────────────────────────

/** Format an option list as a bare comma-separated string. */
function _fmtOpts(options) {
  if (!options.length) return "\u2014"; // em dash for no-option indicators
  return options
    .map((o) => (o === Math.floor(o) ? String(o) : String(o)))
    .join(", ");
}

function _printRow(impl, symbol, options, t, ratio = null) {
  const opts = _fmtOpts(options);
  let ratioStr = "";
  if (ratio !== null) {
    if (ratio < 1.0) {
      ratioStr = `  \u00d7${(1 / ratio).toFixed(1)} faster than tulip_rs`;
    } else {
      ratioStr = `  \u00d7${ratio.toFixed(1)} slower than tulip_rs`;
    }
  }
  const mean = t.mean_ns.toLocaleString("en-US").padStart(12);
  const stddev = t.stddev_ns.toLocaleString("en-US");
  console.log(
    `    ${impl.padEnd(22)} ${symbol.padEnd(14)} [${opts}]  ${mean} ns \u00b1 ${stddev}${ratioStr}`,
  );
}

// ── Core runner ───────────────────────────────────────────────────────────────

/**
 * Run one benchmark definition against every stock and every option set.
 *
 * Prints ns timings to stdout; optionally writes rows to the DB.
 * For each (stock × options) pair:
 *   1. Times tulipFn → logs as 'tulip_rs_node'
 *   2. If refFn is not null: times refFn → logs as 'technicalindicators', prints ratio
 *
 * @param {object}               defn    — benchmark module (name, optionsList, tulipFn, refFn)
 * @param {object[]}             stocks  — array of loadStockData() results
 * @param {BenchmarkLogger|null} logger  — null → stdout only
 */
async function runBenchmark(defn, stocks, logger) {
  console.log(`\n${"─".repeat(64)}`);
  console.log(`  ${defn.name.toUpperCase()}`);
  console.log("─".repeat(64));

  for (const data of stocks) {
    // Pre-convert Float64Arrays → plain Arrays once per stock, outside the timed
    // region, so reference implementations receive the Array<number> they expect.
    const refData =
      defn.refFn != null || defn.ref2Fn != null
        ? {
            ...data,
            open: Array.from(data.open),
            high: Array.from(data.high),
            low: Array.from(data.low),
            close: Array.from(data.close),
            volume: Array.from(data.volume),
          }
        : null;

    for (const options of defn.optionsList) {
      // ── tulip-rs-node ──────────────────────────────────────────────────────
      const tulipTiming = timeFn(() => defn.tulipFn(data, options));
      _printRow("tulip_rs_node", data.symbol, options, tulipTiming);
      if (logger) {
        await logger.log({
          indicatorName: defn.name,
          implType: "tulip_rs_node",
          options,
          timing: tulipTiming,
          symbol: data.symbol,
          inputSize: data.length,
        });
      }

      // ── technicalindicators reference ──────────────────────────────────────
      if (defn.refFn != null) {
        const refTiming = timeFn(() => defn.refFn(refData, options));
        const ratio =
          tulipTiming.mean_ns > 0
            ? refTiming.mean_ns / tulipTiming.mean_ns
            : Infinity;
        _printRow(
          "technicalindicators",
          data.symbol,
          options,
          refTiming,
          ratio,
        );
        if (logger) {
          await logger.log({
            indicatorName: defn.name,
            implType: "technicalindicators",
            options,
            timing: refTiming,
            symbol: data.symbol,
            inputSize: data.length,
          });
        }
      }

      // ── indicatorts reference ─────────────────────────────────────────
      if (defn.ref2Fn != null) {
        const ref2Timing = timeFn(() => defn.ref2Fn(refData, options));
        const ratio =
          tulipTiming.mean_ns > 0
            ? ref2Timing.mean_ns / tulipTiming.mean_ns
            : Infinity;
        _printRow("indicatorts", data.symbol, options, ref2Timing, ratio);
        if (logger) {
          await logger.log({
            indicatorName: defn.name,
            implType: "indicatorts",
            options,
            timing: ref2Timing,
            symbol: data.symbol,
            inputSize: data.length,
          });
        }
      }
    }
  }
}

// ── Exports ───────────────────────────────────────────────────────────────────

export {
  timeFn,
  loadStockData,
  BenchmarkLogger,
  runBenchmark,
  LOG_TO_DB,
  BENCH_NUMBER,
  BENCH_REPEAT,
  BENCH_WARMUP,
};
