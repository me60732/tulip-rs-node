# tulip_rs_node — Project Proposal

Node.js native bindings for [tulip_rs](https://github.com/me60732/tulip_rs) using **napi-rs** (direct compilation, not WASM).

---

## Technology Stack

| Layer | Choice | Why |
|---|---|---|
| Binding framework | **napi-rs v2** | The standard for native Node.js addons from Rust. Auto-generates `.d.ts` TypeScript definitions from `#[napi]` attributes. |
| State serialization | **bincode** (primary) + **serde_json** (secondary) | Bincode is fast and compact — state round-trips as a Node.js `Buffer`. JSON provided for human-readable interop and debugging. |
| JS wrapper | **TypeScript** | Compiles to plain JS. Plain JS users are unaffected — `.d.ts` files are compile-time only. |
| Toolchain | **nightly Rust** (pinned via `rust-toolchain.toml`) | Required by `tulip_rs` which uses `portable_simd`. Same pin as the Python bindings. |

---

## Project Structure

```
tulip_rs_node/
├── Cargo.toml               # napi + napi-derive + bincode + serde + tulip_rs
├── build.rs                 # calls napi_build::setup()
├── package.json             # @napi-rs/cli devDep, napi config
├── tsconfig.json
├── rust-toolchain.toml      # nightly (same as Python bindings)
├── .npmignore
├── .gitignore
├── PROPOSAL.md              # this file
├── index.js                 # compiled from index.ts — public entry point (ti.sma.*, …)
├── index.d.ts               # auto-generated TypeScript definitions (napi-rs)
├── src-ts/
│   └── indicator.ts         # Indicator<S> class — wraps flat napi-rs exports into ti.sma.* etc.
├── src/
│   ├── lib.rs               # #[napi] exports for all indicators
│   ├── utils.rs             # shared helpers (error mapping, slice helpers)
│   └── indicators/
│       ├── mod.rs
│       ├── ad.rs
│       ├── adosc.rs
│       ├── adx.rs
│       ├── adxr.rs
│       ├── ao.rs
│       ├── apo.rs
│       ├── aroon.rs
│       ├── aroonosc.rs
│       ├── atr.rs
│       ├── avgprice.rs
│       ├── bbands.rs
│       ├── bop.rs
│       ├── candlestick.rs
│       ├── cci.rs
│       ├── cmo.rs
│       ├── cvi.rs
│       ├── dema.rs
│       ├── di.rs
│       ├── dm.rs
│       ├── dpo.rs
│       ├── dx.rs
│       ├── ema.rs
│       ├── emv.rs
│       ├── fisher.rs
│       ├── fosc.rs
│       ├── hma.rs
│       ├── kama.rs
│       ├── kvo.rs
│       ├── linreg.rs
│       ├── macd.rs
│       ├── marketfi.rs
│       ├── mass.rs
│       ├── max.rs
│       ├── md.rs
│       ├── medprice.rs
│       ├── mfi.rs
│       ├── min.rs
│       ├── mom.rs
│       ├── msw.rs
│       ├── natr.rs
│       ├── nvi.rs
│       ├── obv.rs
│       ├── pivotpoint.rs
│       ├── ppo.rs
│       ├── psar.rs
│       ├── pvi.rs
│       ├── qstick.rs
│       ├── roc.rs
│       ├── rocr.rs
│       ├── rsi.rs
│       ├── sma.rs
│       ├── stddev.rs
│       ├── stoch.rs
│       ├── stochrsi.rs
│       ├── tema.rs
│       ├── tr.rs
│       ├── trima.rs
│       ├── trix.rs
│       ├── tsf.rs
│       ├── typprice.rs
│       ├── ultosc.rs
│       ├── vhf.rs
│       ├── vidya.rs
│       ├── volatility.rs
│       ├── vosc.rs
│       ├── vwma.rs
│       ├── wad.rs
│       ├── wcprice.rs
│       ├── wilders.rs
│       ├── willr.rs
│       ├── wma.rs
│       └── zlema.rs
└── examples/
    ├── basic.js
    ├── streaming.js
    └── simd.js
```

---

## API Design

### Namespace shape

Every indicator is exposed as a property of the top-level `ti` object.  Each
property is itself a plain object (a *namespace*) with a fixed set of members:

```
ti.<name>.indicator(inputs, options, optionalOutputs?)
ti.<name>.info
          ^^^  static object, not a function — populated once at load time
ti.<name>.minData(options)
ti.<name>.outputLength(dataLen, options)
ti.<name>.minDataAccuracy(options, decimals)
ti.<name>.simdByAssets(inputs, options, optionalOutputs?)
ti.<name>.simdByOptions(inputs, options, optionalOutputs?)  // absent when OPTIONS_WIDTH === 0
ti.<name>.State                                             // the napi-rs class
```

### JavaScript / TypeScript usage

```js
const ti = require('tulip-rs-node');

// ── Basic indicator ─────────────────────────────────────────────────────────
const [outputs, state] = ti.sma.indicator([close], [5.0]);
console.log(outputs[0]);  // Float64Array of SMA values

// ── Streaming continuation ───────────────────────────────────────────────────
const moreOutputs = state.batchIndicator([newClose]);

// ── State persistence — bincode Buffer (fast, compact) ──────────────────────
const buf = state.toBuffer();
require('fs').writeFileSync('sma_state.bin', buf);

const restored = ti.sma.State.fromBuffer(require('fs').readFileSync('sma_state.bin'));
const resumed = restored.batchIndicator([newClose]);

// ── State persistence — JSON (human readable, Python-interop) ───────────────
const json = state.toJson();
const restored2 = ti.sma.State.fromJson(json);

// ── Static info object (not a function call) ─────────────────────────────────
console.log(ti.sma.info);          // { name, fullName, inputs, options, outputs }
const minBars = ti.sma.minData([5.0]);          // number
const outLen  = ti.sma.outputLength(100, [5.0]);

// ── SIMD — by assets (2, 4, 8, or 16) ──────────────────────────────────────
const [results, states] = ti.sma.simdByAssets(
  [[close1], [close2], [close3], [close4]],
  [5.0]
);

// ── SIMD — by options (2, 4, 8, or 16) ─────────────────────────────────────
const [results2, states2] = ti.sma.simdByOptions(
  [close],
  [[5.0], [10.0], [20.0], [50.0]]
);

// ── Candlestick patterns ─────────────────────────────────────────────────────
const [patterns, cdlState] = ti.candlestick.indicator(open, high, low, close);
// patterns: Array<null | Array<{ name, fullName, bars, forecast }>>
```

### TypeScript users get full type safety automatically
```ts
import * as ti from 'tulip-rs-node';

const [outputs, state]: [number[][], ti.SmaState] =
  ti.sma.indicator([close], [5.0]);

const buf: Buffer = state.toBuffer();
const restored: ti.SmaState = ti.sma.State.fromBuffer(buf);
```

### Namespace assembly — the `Indicator` class

The native Rust layer (napi-rs) exports flat, prefixed symbols:
`smaIndicator`, `smaInfo`, `SmaState`, etc.  A thin TypeScript layer in
`src-ts/indicator.ts` (compiled to `index.js`) wraps each indicator in an
`Indicator<S>` class instance, so `ti.sma` is a real class object with proper
console representation, `instanceof` support, and full type safety.

```ts
// src-ts/indicator.ts
import * as native from '../index';  // napi-rs generated re-export

export interface IndicatorInfo {
  name:     string;
  fullName: string;
  inputs:   string[];
  options:  string[];
  outputs:  string[];
}

/**
 * Wraps a single indicator's flat napi-rs exports into a typed class.
 *
 * `S` is the napi-rs State class for this indicator (e.g. `SmaState`).
 */
export class Indicator<S> {
  /** Static metadata — populated once at construction, never changes. */
  readonly info: IndicatorInfo;

  /** Run the indicator on a batch of data. Returns `[outputs, state]`. */
  readonly indicator: (inputs: number[][], options: number[], optOutputs?: number[]) => [number[][], S];

  /** Minimum number of input bars required. */
  readonly minData: (options: number[]) => number;

  /** Number of output bars produced for a given input length. */
  readonly outputLength: (dataLen: number, options: number[]) => number;

  /** Minimum bars needed to achieve a given decimal accuracy. */
  readonly minDataAccuracy: (options: number[], decimals: number) => number;

  /** SIMD — run N assets in a single pass (N = 2 | 4 | 8 | 16). */
  readonly simdByAssets: (inputs: number[][][], options: number[], optOutputs?: number[]) => [number[][][], S[]];

  /**
   * SIMD — run N option sets in a single pass (N = 2 | 4 | 8 | 16).
   * `undefined` for indicators with no options (OPTIONS_WIDTH === 0).
   */
  readonly simdByOptions?: (inputs: number[][], options: number[][], optOutputs?: number[]) => [number[][][], S[]];

  /** The napi-rs State class — use `ti.sma.State.fromBuffer(buf)` to restore. */
  readonly State: { new(...args: any[]): S; fromBuffer(buf: Buffer): S; fromJson(json: string): S };

  constructor(name: string) {
    const cap = name.charAt(0).toUpperCase() + name.slice(1);
    const n   = native as any;

    this.info            = n[`${name}Info`]();    // call once, cache as property
    this.indicator       = n[`${name}Indicator`];
    this.minData         = n[`${name}MinData`];
    this.outputLength    = n[`${name}OutputLength`];
    this.minDataAccuracy = n[`${name}MinDataAccuracy`];
    this.simdByAssets    = n[`${name}SimdByAssets`];
    this.simdByOptions   = n[`${name}SimdByOptions`];  // undefined when absent
    this.State           = n[`${cap}State`];
  }
}
```

```ts
// index.ts — the public entry point
import { Indicator } from './src-ts/indicator';
import type { SmaState, MacdState, EmaState /*, … */ } from './index';  // napi-rs types

export const sma       = new Indicator<SmaState>('sma');
export const macd      = new Indicator<MacdState>('macd');
export const ema       = new Indicator<EmaState>('ema');
// … one line per indicator

// Re-export the State classes directly for users who want them at the top level
export type { SmaState, MacdState, EmaState /*, … */ };
```

This keeps the Rust side simple (flat `#[napi]` exports) and puts the
ergonomic shaping entirely in the typed class wrapper where it belongs.

> **Why `info` is a property, not a method**
> `smaInfo()` is called once at construction inside the `Indicator` constructor
> and stored as `this.info`.  Accessing metadata then feels like reading a
> field (`ti.sma.info.name`) rather than calling a factory, and there is zero
> repeated overhead.

> **Why `Indicator<S>` instances rather than a class with all-static members**
> Instances are constructed with a name string, so a single class definition
> covers all 70 indicators without code generation.  Static-only classes
> would require 70 separate class bodies.  Instances still appear as
> `Indicator {}` in the Node.js REPL, support `instanceof Indicator`, and
> can be passed around as first-class values.

---

## Rust Implementation Pattern

### Per-indicator file structure (e.g. `src/indicators/sma.rs`)

The Rust layer keeps a flat, prefixed export style.  The JS `register()`
wrapper above assembles these into `ti.sma.*` at load time.

Every indicator file exports:
- `{Name}State` — `#[napi]` class wrapping the Rust `IndicatorState`
  - `batchIndicator(inputs, optionalOutputs?) -> number[][]`
  - `toJson() -> string`
  - `fromJson(json: string) -> {Name}State` (factory)
  - `toBuffer() -> Buffer` (bincode)
  - `fromBuffer(buf: Buffer) -> {Name}State` (bincode factory)
- `{name}Indicator(inputs, options, optionalOutputs?) -> [number[][], {Name}State]`
- `{name}Info() -> object`  *(called once by `register()`, result cached as `ti.{name}.info`)*
- `{name}MinData(options) -> number`
- `{name}OutputLength(dataLen, options) -> number`
- `{name}MinDataAccuracy(options, decimals) -> number`
- `{name}SimdByAssets(inputs, options, optionalOutputs?) -> [number[][][], {Name}State[]]`
- `{name}SimdByOptions(inputs, options, optionalOutputs?) -> [number[][][], {Name}State[]]`
  *(only for indicators with at least 1 option — `register()` omits `simdByOptions` when absent)*

### SIMD const-generic dispatch

Exactly mirrors the Python binding pattern — runtime count matched to const generic:

```rust
let result = match num_assets {
    2 => {
        let arr: &[&[&[f64]; INPUTS_WIDTH]; 2] = input_refs.as_slice().try_into().unwrap();
        rust_sma::by_assets::indicator::<2>(arr, &options_array, optional_outputs.as_deref())
    }
    4  => { /* indicator::<4>  */ }
    8  => { /* indicator::<8>  */ }
    16 => { /* indicator::<16> */ }
    _ => unreachable!("validated above"),
};
```

### State serialization

```rust
// Bincode (fast binary) — primary
#[napi]
pub fn to_buffer(&self) -> Result<Buffer> {
    bincode::serialize(&self.inner)
        .map(Buffer::from)
        .map_err(|e| Error::new(Status::GenericFailure, e.to_string()))
}

#[napi(factory)]
pub fn from_buffer(buf: Buffer) -> Result<Self> {
    let inner = bincode::deserialize(buf.as_ref())
        .map_err(|e| Error::new(Status::InvalidArg, e.to_string()))?;
    Ok(Self { inner })
}

// JSON — human-readable / Python interop
#[napi]
pub fn to_json(&self) -> Result<String> { /* serde_json::to_string */ }

#[napi(factory)]
pub fn from_json(json: String) -> Result<Self> { /* serde_json::from_str */ }
```

---

## Indicator Reference

Full inputs / options / outputs for all 70 indicators:

| Indicator | Inputs | Options | Outputs |
|---|---|---|---|
| `ad` | `[high, low, close, volume]` | `[]` | `[ad]` |
| `adosc` | `[high, low, close, volume]` | `[short_period, long_period]` | `[adosc]` |
| `adx` | `[high, low, close]` | `[period]` | `[adx]` |
| `adxr` | `[high, low, close]` | `[period]` | `[adxr]` |
| `ao` | `[high, low]` | `[]` | `[ao]` |
| `apo` | `[real]` | `[short_period, long_period]` | `[apo]` |
| `aroon` | `[high, low]` | `[period]` | `[aroon_down, aroon_up]` |
| `aroonosc` | `[high, low]` | `[period]` | `[aroonosc]` |
| `atr` | `[high, low, close]` | `[period]` | `[atr]` |
| `avgprice` | `[open, high, low, close]` | `[]` | `[avgprice]` |
| `bbands` | `[real]` | `[period, stddev_multiplier]` | `[lower, middle, upper]` |
| `bop` | `[open, high, low, close]` | `[]` | `[bop]` |
| `candlestick` | `[open, high, low, close]` | `[candle_period, trend_period, trend_signal_period]` | `[patterns]` (special) |
| `cci` | `[high, low, close]` | `[period]` | `[cci]` |
| `cmo` | `[real]` | `[period]` | `[cmo]` |
| `cvi` | `[high, low]` | `[period]` | `[cvi]` |
| `dema` | `[real]` | `[period]` | `[dema]` |
| `di` | `[high, low, close]` | `[period]` | `[plus_di, minus_di]` |
| `dm` | `[high, low]` | `[period]` | `[plus_dm, minus_dm]` |
| `dpo` | `[real]` | `[period]` | `[dpo]` |
| `dx` | `[high, low, close]` | `[period]` | `[dx]` |
| `ema` | `[real]` | `[period]` | `[ema]` |
| `emv` | `[high, low, volume]` | `[]` | `[emv]` |
| `fisher` | `[high, low]` | `[period]` | `[fisher, fisher_signal]` |
| `fosc` | `[real]` | `[period]` | `[fosc]` |
| `hma` | `[real]` | `[period]` | `[hma]` |
| `kama` | `[real]` | `[period]` | `[kama]` |
| `kvo` | `[high, low, close, volume]` | `[short_period, long_period]` | `[kvo]` |
| `linreg` | `[real]` | `[period]` | `[linreg]` |
| `macd` | `[real]` | `[fast_period, slow_period, signal_period]` | `[macd, signal, histogram]` |
| `marketfi` | `[high, low, volume]` | `[]` | `[marketfi]` |
| `mass` | `[high, low]` | `[period]` | `[mass]` |
| `max` | `[real]` | `[period]` | `[max]` |
| `md` | `[real]` | `[period]` | `[md]` |
| `medprice` | `[high, low]` | `[]` | `[medprice]` |
| `mfi` | `[high, low, close, volume]` | `[period]` | `[mfi]` |
| `min` | `[real]` | `[period]` | `[min]` |
| `mom` | `[real]` | `[period]` | `[mom]` |
| `msw` | `[real]` | `[period]` | `[msw_sine, msw_lead]` |
| `natr` | `[high, low, close]` | `[period]` | `[natr]` |
| `nvi` | `[real, volume]` | `[]` | `[nvi]` |
| `obv` | `[real, volume]` | `[]` | `[obv]` |
| `pivotpoint` | `[high, low, close]` | `[]` | `[pivot, r1, s1, r2, s2]` |
| `ppo` | `[real]` | `[short_period, long_period]` | `[ppo]` |
| `psar` | `[high, low]` | `[accel_step, accel_max]` | `[psar]` |
| `pvi` | `[real, volume]` | `[]` | `[pvi]` |
| `qstick` | `[open, close]` | `[period]` | `[qstick]` |
| `roc` | `[real]` | `[period]` | `[roc]` |
| `rocr` | `[real]` | `[period]` | `[rocr]` |
| `rsi` | `[real]` | `[period]` | `[rsi]` |
| `sma` | `[real]` | `[period]` | `[sma]` |
| `stddev` | `[real]` | `[period]` | `[stddev]` |
| `stoch` | `[high, low, close]` | `[k_period, k_slowing, d_period]` | `[stoch_k, stoch_d]` |
| `stochrsi` | `[real]` | `[period]` | `[stochrsi]` |
| `tema` | `[real]` | `[period]` | `[tema]` |
| `tr` | `[high, low, close]` | `[]` | `[tr]` |
| `trima` | `[real]` | `[period]` | `[trima]` |
| `trix` | `[real]` | `[period]` | `[trix]` |
| `tsf` | `[real]` | `[period]` | `[tsf]` |
| `typprice` | `[high, low, close]` | `[]` | `[typprice]` |
| `ultosc` | `[high, low, close]` | `[short, medium, long]` | `[ultosc]` |
| `vhf` | `[real]` | `[period]` | `[vhf]` |
| `vidya` | `[real]` | `[short_period, long_period, alpha]` | `[vidya]` |
| `volatility` | `[real]` | `[period]` | `[volatility]` |
| `vosc` | `[volume]` | `[short_period, long_period]` | `[vosc]` |
| `vwma` | `[real, volume]` | `[period]` | `[vwma]` |
| `wad` | `[high, low, close]` | `[]` | `[wad]` |
| `wcprice` | `[high, low, close]` | `[]` | `[wcprice]` |
| `wilders` | `[real]` | `[period]` | `[wilders]` |
| `willr` | `[high, low, close]` | `[period]` | `[willr]` |
| `wma` | `[real]` | `[period]` | `[wma]` |
| `zlema` | `[real]` | `[period]` | `[zlema]` |

Indicators with **no options** do **not** expose a `simdByOptions` function.
These are: `ad`, `ao`, `avgprice`, `bop`, `emv`, `marketfi`, `medprice`, `nvi`, `obv`, `pivotpoint`, `pvi`, `tr`, `typprice`, `wad`, `wcprice`.

---

## `Cargo.toml` Dependencies

```toml
[dependencies]
napi        = { version = "2", features = ["napi4"] }
napi-derive = "2"
serde       = { version = "1", features = ["derive"] }
serde_json  = "1"
bincode     = "1"
tulip_rs    = { git = "https://github.com/me60732/tulip_rs.git", default-features = true }

[build-dependencies]
napi-build = "2"
```

---

## Build & Usage

```bash
# Install napi-rs CLI
npm install

# Development build
npx napi build --platform

# Release build
RUSTFLAGS="-C target-cpu=native" npx napi build --platform --release

# Use in Node.js
node examples/basic.js
```

---

## Key Differences from Python Bindings

| | Python (`pyo3`/`maturin`) | Node.js (`napi-rs`) |
|---|---|---|
| Input arrays | `PyReadonlyArray1<f64>` (numpy) | `Float64Array` (typed arrays) |
| Class decoration | `#[pyclass]` / `#[pymethods]` | `#[napi]` on struct + impl |
| Module registration | `register_*_module()` functions | All `#[napi]` items auto-exported |
| State pickling | `__getstate__` / `__setstate__` | `toBuffer()`/`fromBuffer()` (bincode) + `toJson()`/`fromJson()` |
| Return tuple | `(Vec<Vec<f64>>, State)` → Python tuple | `(Vec<Vec<f64>>, State)` → JS array `[outputs, state]` |
| SIMD dispatch | `match num_assets { 2 => indicator::<2> ... }` | **identical** |
| Error type | `PyErr` | `napi::Error` |

---

## Status

- [ ] Foundation files (Cargo.toml, package.json, build.rs, lib.rs, utils.rs)
- [ ] `src-ts/indicator.ts` — `Indicator<S>` class + `IndicatorInfo` interface
- [ ] `index.ts` — one `new Indicator<XState>('x')` per indicator, State type re-exports
- [ ] Indicators A–D (ad, adosc, adx, adxr, ao, apo, aroon, aroonosc, atr, avgprice, bbands, bop, candlestick, cci, cmo, cvi, dema, di, dm, dpo, dx)
- [ ] Indicators E–P (ema, emv, fisher, fosc, hma, kama, kvo, linreg, macd, marketfi, mass, max, md, medprice, mfi, min, mom, msw, natr, nvi, obv, pivotpoint, ppo, psar, pvi)
- [ ] Indicators Q–Z (qstick, roc, rocr, rsi, sma, stddev, stoch, stochrsi, tema, tr, trima, trix, tsf, typprice, ultosc, vhf, vidya, volatility, vosc, vwma, wad, wcprice, wilders, willr, wma, zlema)
- [ ] Examples (basic.js, streaming.js, simd.js)
