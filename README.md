# tulip-rs-node

[![npm](https://img.shields.io/npm/v/tulip-rs-node.svg)](https://www.npmjs.com/package/tulip-rs-node)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**High-performance technical analysis for Node.js — powered by Rust.**

Native Node.js bindings for [TulipRS](https://github.com/me60732/tulip_rs) via
[napi-rs](https://napi.rs). Implements 70+ technical indicators and 60+
candlestick patterns with first-class SIMD acceleration. Process multiple assets
or multiple parameter sets in a single CPU pass, stream live bars into stateful
indicators without reprocessing history.

---

## Why tulip-rs-node?

| | tulip-rs-node | tulipindicators / technicalindicators |
|---|---|---|
| **SIMD — multiple assets** | ✅ N assets in one pass | ❌ one asset at a time |
| **SIMD — multiple options** | ✅ N parameter sets in one pass | ❌ one parameter set at a time |
| **Stateful streaming** | ✅ resume from saved state | ❌ full recompute each tick |
| **State serialisation** | ✅ `Buffer` (bincode) + JSON | ❌ |
| **Performance** | ✅ native Rust + SIMD | ❌ pure JS |

---

## Installation

```bash
npm install tulip-rs-node
```

> Prebuilt binaries are provided for Linux x64, macOS x64, and macOS arm64.
> No Rust toolchain required for end users.

### Build from source

Requires Rust nightly (pinned via `rust-toolchain.toml`) and
[`@napi-rs/cli`](https://napi.rs/docs/introduction/getting-started).

```bash
git clone https://github.com/me60732/tulip_rs_node
cd tulip_rs_node
npm install
npm run build
```

---

## Quick Start

Every indicator lives on the `ti` namespace object and follows the same API —
learn it once, use it everywhere.

```js
import * as ti from 'tulip-rs-node';

const close = [81.59, 81.06, 82.87, 83.00, 83.61,
               83.15, 82.84, 83.99, 84.55, 84.36];

// inputs: number[][]  |  options: number[]
const [outputs, state] = ti.ema.indicator([close], [5]);

console.log(outputs[0]); // EMA(5) values

// Streaming: feed new bars without reprocessing history
const newBar = [85.10];
const nextOutputs = state.batchIndicator([newBar]);
```

---

## API

### Indicator info

```js
const info = ti.sma.info;
// {
//   name: 'sma',
//   fullName: 'Simple Moving Average',
//   inputs: ['real'],
//   options: ['period'],
//   outputs: ['sma'],
//   optionalOutputs: [],
//   indicatorType: 'Trend',
//   displayType: 'Overlay'
// }

ti.sma.minData([5]);            // minimum bars needed to produce output
ti.sma.minDataAccuracy([5], 6); // bars needed for 6-decimal accuracy
```

### Running an indicator

```js
const [outputs, state] = ti.sma.indicator([close], [5]);
// outputs: number[][]   — one array per output series
// state:   SmaState     — snapshot of internal state after the last bar
```

### Streaming continuation

Save the state after an initial batch, then feed new bars incrementally without
touching the history:

```js
const [outputs, state] = ti.sma.indicator([close.slice(0, -5)], [5]);

// later — new bars arrive
const newOutputs = state.batchIndicator([close.slice(-5)]);
```

### State serialisation

States can be round-tripped to a `Buffer` (fast, binary) or JSON (human-readable,
useful for cross-process or cross-language transfer):

```js
// save
const buf  = state.toBuffer();
const json = state.toJson();

// restore
const stateA = ti.sma.State.fromBuffer(buf);
const stateB = ti.sma.State.fromJson(json);
```

### SIMD — multiple assets

Process N assets in a single CPU pass. N must be 2, 4, 8, or 16.

```js
const simdInputs = [
  [asset1Close],   // asset 1
  [asset2Close],   // asset 2
  [asset3Close],   // asset 3
  [asset4Close],   // asset 4
];

const [results, states] = ti.sma.simdByAssets(simdInputs, [14]);

results.forEach((output, i) => {
  console.log(`Asset ${i + 1} SMA:`, output[0]);
});
```

### SIMD — multiple option sets

Run N different parameter sets against the same data in one pass.
N must be 2, 4, 8, or 16.

```js
const simdOptions = [[2], [5], [8], [10]]; // 4 period values

const [results, states] = ti.sma.simdByOptions([close], simdOptions);

results.forEach((output, i) => {
  console.log(`Period ${simdOptions[i][0]} SMA:`, output[0]);
});
```

### Multi-input indicators

Indicators that need more than one price series take them as additional arrays
in the `inputs` argument:

```js
// STOCH — high, low, close
const [outputs] = ti.stoch.indicator([high, low, close], [5, 3, 3]);
// outputs[0] → %K line
// outputs[1] → %D line

// MACD — close only, three output series
const [outputs] = ti.macd.indicator([close], [2, 5, 9]);
// outputs[0] → MACD line
// outputs[1] → Signal line
// outputs[2] → Histogram

// AD — high, low, close, volume
const [outputs] = ti.ad.indicator([high, low, close, volume], []);
```

### Candlestick patterns

The candlestick indicator returns pattern objects per bar instead of numeric
series:

```js
const [result, state] = ti.candlestick.indicator(
  [open, high, low, close],
  [5, 1, 1], // candle_period, trend_period, trend_signal_period
);

result.forEach((patterns, bar) => {
  if (patterns.length > 0) {
    patterns.forEach(p => {
      console.log(`Bar ${bar}: ${p.fullName} (${p.forecast})`);
    });
  }
});

// Streaming — append one new bar
const newBar = state.batchIndicator([newOpen, newHigh, newLow, newClose]);
```

Each pattern object has:

```js
{
  name:         'ThreeWhiteSoldiers',
  fullName:     'Three White Soldiers',
  japaneseName: 'akasankuusen',
  bars:         3,
  forecast:     'BullishReversal'
}
```

---

## Indicators

| Category | Indicators |
|---|---|
| **Trend** | SMA, EMA, DEMA, TEMA, WMA, HMA, KAMA, TRIMA, ZLEMA, WILDERS, VIDYA, LINREG, TSF |
| **Momentum** | RSI, CMO, MOM, ROC, ROCR, STOCH, STOCHRSI, DPO, FOSC, MACD, APO, PPO |
| **Volatility** | ATR, NATR, VOLATILITY, BBANDS, STDDEV, MD |
| **Volume** | OBV, AD, ADOSC, MFI, EMV, NVI, PVI, KVO, VWMA, VOSC |
| **Directional** | ADX, ADXR, DI, DM, DX, AROON, AROONOSC, PSAR |
| **Price** | AVGPRICE, MEDPRICE, TYPPRICE, WCPRICE |
| **Other** | AO, BOP, CCI, CVI, FISHER, MASS, MARKETFI, MSW, QSTICK, TR, VHF, WAD, WILLR, PIVOTPOINT, ULTOSC |
| **Candlestick** | 60+ patterns via `ti.candlestick` |

---

## Running the Examples

Build the package first, then run any example directly with Node:

```bash
npm run build
node examples/ti_sma_example.js
node examples/ti_macd_example.js
node examples/ti_candlestick_example.js
```

Examples are provided for every indicator under `examples/`.

---

## Language Support

| Language | Status | Package |
|---|---|---|
| **Node.js** | ✅ Supported | `tulip-rs-node` (this repo) |
| **Rust** | ✅ Native | [`tulip_rs`](https://github.com/me60732/tulip_rs) |
| **Python** | ✅ Supported | [`tulip_rs_python`](https://github.com/me60732/tulip_rs_python) · `pip install tulip-rs` |
| R | 🔜 Planned | — |
| Julia | 🔜 Planned | — |

---

## License

[MIT](LICENSE)
