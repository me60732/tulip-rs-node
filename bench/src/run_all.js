/**
 * Entry point for tulip-rs-node-bench.
 *
 * Usage (from bench/ directory):
 *   npm run bench                        # all indicators, stdout only
 *   npm run bench:db                     # write results to indicator_benchmark DB
 *   node src/run_all.js sma rsi macd     # specific indicators by name
 */

import { readdir } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import {
  loadStockData,
  BenchmarkLogger,
  runBenchmark,
  LOG_TO_DB,
} from "./common.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const INDICATORS_DIR = join(__dirname, "indicators");

/**
 * Discover all bench_*.js files in the indicators/ directory.
 * Returns an array of [fileStem, module] pairs, sorted alphabetically.
 */
async function discover() {
  const files = (await readdir(INDICATORS_DIR))
    .filter((f) => f.startsWith("bench_") && f.endsWith(".js"))
    .sort();

  const result = [];
  for (const f of files) {
    // Dynamic import requires an absolute path (or file: URL) for ESM.
    const mod = await import(join(INDICATORS_DIR, f));
    if (!mod.name) {
      console.warn(`[warn] ${f} has no 'name' export — skipping`);
      continue;
    }
    result.push([f.replace(".js", ""), mod]);
  }
  return result;
}

async function main() {
  // Optional positional args: indicator names to run (e.g. "node run_all.js sma rsi")
  const filterNames = process.argv.slice(2);

  console.log("=".repeat(64));
  console.log("  tulip-rs Node.js Benchmark Suite");
  console.log("=".repeat(64));

  // ── 1. Load stock data ────────────────────────────────────────────────────
  console.log("\n[1/3] Loading stock data ...");
  const stocks = await loadStockData();
  if (!stocks.length) {
    console.error("[error] No stock data — is the stocks DB running?");
    process.exit(1);
  }

  // ── 2. Connect to benchmark DB (optional) ────────────────────────────────
  let logger = null;
  if (LOG_TO_DB) {
    console.log("\n[2/3] Connecting to benchmark DB ...");
    logger = new BenchmarkLogger();
    await logger.init();
    await logger.startRun();
  } else {
    console.log(
      "\n[2/3] DB logging disabled (BENCHMARK_LOG_TO_DB=0) — stdout only",
    );
  }

  // ── 3. Discover and run benchmarks ───────────────────────────────────────
  console.log("\n[3/3] Running benchmarks ...");
  let benchmarks = await discover();

  if (filterNames.length) {
    benchmarks = benchmarks.filter(([, mod]) => filterNames.includes(mod.name));
    if (!benchmarks.length) {
      console.error(`[error] No benchmarks matched: ${filterNames.join(", ")}`);
      process.exit(1);
    }
  }

  const t0 = performance.now();
  for (const [, mod] of benchmarks) {
    await runBenchmark(mod, stocks, logger);
  }
  const elapsed = ((performance.now() - t0) / 1000).toFixed(1);

  console.log(`\n${"=".repeat(64)}`);
  console.log(`  Finished ${benchmarks.length} indicator(s) in ${elapsed}s`);
  if (logger) {
    console.log(`  Results written to DB (run_id=${logger.runId})`);
    await logger.close();
  }
  console.log("=".repeat(64));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
