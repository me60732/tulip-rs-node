# tulip-rs-node-bench

Node.js benchmark suite comparing the **tulip-rs-node native addon** against
[technicalindicators](https://github.com/anandanand84/technicalindicators) — a
pure-JavaScript technical-analysis library.

This package lives inside the `tulip_rs_node` repository as a self-contained
sub-package with its own `package.json`, mirroring the Python bench at
`tulip_rs_python/bench/`.

---

## Prerequisites

- **Node.js ≥ 18** (uses `process.hrtime.bigint()`, `performance`, ESM `import`)
- **PostgreSQL** — two databases are required:
  - `stocks` — OHLCV data for BHP/ASX, CBA/ASX, AAPL/NYSE, MSFT/NYSE
  - `indicator_benchmark` — result storage (only needed when `BENCHMARK_LOG_TO_DB=1`)
- The `tulip-rs-node` native addon must be **built** before installing
  (`npm run build` in the parent `tulip_rs_node/` directory)

---

## Setup

### 1. Build the native addon

```bash
cd ..                   # tulip_rs_node/
npm run build           # compiles Rust + TypeScript
```

### 2. Install bench dependencies

```bash
cd bench/
npm install
```

### 3. Configure environment

```bash
cp .env.example .env
# Edit .env — set STOCKS_DATABASE_URL and BENCHMARK_DATABASE_URL
```

### 4. Start the database

```bash
docker compose -f docker/docker-compose.yaml up -d
```

The Docker Compose file starts a PostgreSQL 16 container and initialises both
databases via the SQL scripts in `docker/scripts/`.

---

## Running

```bash
# All indicators — stdout only (no DB writes)
npm run bench

# All indicators — write results to indicator_benchmark DB
npm run bench:db

# Specific indicators by name (any subset, space-separated)
node src/run_all.js sma rsi macd
node src/run_all.js adx atr bbands
```

### Example output

```
================================================================
  tulip-rs Node.js Benchmark Suite
================================================================

[1/3] Loading stock data ...
  loaded 6,705 bars  BHP/ASX
  loaded 6,705 bars  CBA/ASX
  loaded 6,705 bars  AAPL/NYSE
  loaded 6,705 bars  MSFT/NYSE

[2/3] DB logging disabled (BENCHMARK_LOG_TO_DB=0) — stdout only

[3/3] Running benchmarks ...

────────────────────────────────────────────────────────────────
  SMA
────────────────────────────────────────────────────────────────
    tulip_rs_node          BHP_ASX        [50]      38,214 ns ± 812
    technicalindicators    BHP_ASX        [50]     312,900 ns ± 4,211  ×8.2 slower than tulip_rs
    ...

================================================================
  Finished 21 indicator(s) in 94.3s
================================================================
```

---

## Timing methodology

| Item | Detail |
|------|--------|
| Data | Real OHLCV, **6,705 bars** per stock |
| Stocks | BHP/ASX · CBA/ASX · AAPL/NYSE · MSFT/NYSE |
| Samples | 30 independent timing runs (`BENCH_REPEAT`) |
| Calls/sample | 10 back-to-back calls (`BENCH_NUMBER`) |
| Reported time | Mean of 30 samples, each averaged over 10 calls |
| Unit | Nanoseconds (ns) on screen and in the database |
| Timer | `process.hrtime.bigint()` — nanosecond hardware clock |

Override defaults via env vars: `BENCH_NUMBER=5 BENCH_REPEAT=10 npm run bench`

---

## Indicators covered (21)

All 21 benchmarks have a `technicalindicators` reference implementation.

| File | Indicator | Inputs | `technicalindicators` class |
|------|-----------|--------|-----------------------------|
| bench_ad.js | AD (Acc/Dist Line) | H/L/C/V | `ADL` |
| bench_adx.js | ADX | H/L/C | `ADX` |
| bench_ao.js | Awesome Oscillator | H/L | `AwesomeOscillator` |
| bench_atr.js | ATR | H/L/C | `ATR` |
| bench_bbands.js | Bollinger Bands | close | `BollingerBands` |
| bench_candlestick.js | Candlestick patterns | O/H/L/C | `bullish` / `bearish` |
| bench_cci.js | CCI | H/L/C | `CCI` |
| bench_ema.js | EMA | close | `EMA` |
| bench_macd.js | MACD | close | `MACD` |
| bench_mfi.js | MFI | H/L/C/V | `MFI` |
| bench_obv.js | OBV | close + vol | `OBV` |
| bench_psar.js | Parabolic SAR | H/L/C | `PSAR` |
| bench_roc.js | ROC | close | `ROC` |
| bench_rsi.js | RSI | close | `RSI` |
| bench_sma.js | SMA | close | `SMA` |
| bench_stoch.js | Stochastic | H/L/C | `Stochastic` |
| bench_stochrsi.js | Stochastic RSI | close | `StochasticRSI` |
| bench_trix.js | TRIX | close | `TRIX` |
| bench_wilders.js | Wilder's Smoothing | close | `WEMA` |
| bench_willr.js | Williams %R | H/L/C | `WilliamsR` |
| bench_wma.js | WMA | close | `WMA` |

### Candlestick note

`tulip_rs_node` scans all N bars in a **single native call**, returning a
pattern result for every bar in one pass. `technicalindicators` provides no
equivalent bulk API; the reference implementation in `bench_candlestick.js`
replicates it with a sliding fixed-window loop in JS, iterating bar-by-bar.
The benchmark therefore measures the cost of a full scan, making the approaches
directly comparable on total work, but the architecture differs fundamentally.

The candlestick benchmark uses `name = 'Rust_Candlestick'` which may not match
a row in the `indicators` table — DB writes for this indicator are skipped with
a warning if the name is absent.

---

## Adding a new indicator

1. Create `src/indicators/bench_<name>.js`.
2. Export `name`, `optionsList`, `tulipFn`, and `refFn` (set `refFn = null` if
   there is no `technicalindicators` equivalent).
3. `run_all.js` discovers it automatically — no registration needed.

```js
// src/indicators/bench_myindicator.js
import * as ti from 'tulip-rs-node';
import { MyIndicator } from 'technicalindicators';

export const name = 'myindicator';
export const optionsList = [[14], [20], [30], [50]];

export function tulipFn(data, options) {
  return ti.myindicator.indicator([data.close], options);
}

export function refFn(data, options) {
  return MyIndicator.calculate({ period: options[0], values: data.close });
}

// Set refFn = null if technicalindicators has no equivalent:
// export const refFn = null;
```

---

## Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `STOCKS_DATABASE_URL` | `postgresql://tulip:tulip@localhost:5432/stocks` | OHLCV source DB |
| `DATABASE_URL` | — | Fallback if `STOCKS_DATABASE_URL` is not set |
| `BENCHMARK_DATABASE_URL` | `postgresql://tulip:tulip@localhost:5432/indicator_benchmark` | Result DB |
| `BENCHMARK_LOG_TO_DB` | `0` | Set to `1` to write results to the DB |
| `BENCH_NUMBER` | `10` | Back-to-back calls per timing sample |
| `BENCH_REPEAT` | `30` | Number of independent timing samples |
| `POSTGRES_PORT` | `5432` | Host port for the Docker Compose DB container |
