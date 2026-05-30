/**
 * tulip-rs-node — Node.js native bindings for the tulip_rs technical analysis library.
 *
 * Every indicator is exposed as a namespaced `Indicator` instance:
 *
 *   import ti from 'tulip-rs-node';
 *
 *   const [outputs, state] = ti.sma.indicator([[...close]], [5]);
 *   console.log(ti.sma.info);
 *   const buf = state.toBuffer();
 *   const restored = ti.sma.State.fromBuffer(buf);
 *
 * Build sequence (Rust must compile before TypeScript):
 *   npm run build:native   →  compiles Rust, emits binding.cjs + binding.d.cts
 *   npm run build:ts       →  compiles index.ts → index.js + index.d.ts
 *   npm run build          →  both in one step
 */

import { Indicator } from "./src-ts/indicator.js";

export { Indicator };
export type { IndicatorInfo, DisplayGroup } from "./src-ts/indicator.js";

// ── Indicators ──────────────────────────────────────────────────────────────
export const ad = new Indicator("ad");
export const adosc = new Indicator("adosc");
export const adx = new Indicator("adx");
export const adxr = new Indicator("adxr");
export const ao = new Indicator("ao");
export const apo = new Indicator("apo");
export const aroon = new Indicator("aroon");
export const aroonosc = new Indicator("aroonosc");
export const atr = new Indicator("atr");
export const avgprice = new Indicator("avgprice");
export const bbands = new Indicator("bbands");
export const bop = new Indicator("bop");
export const candlestick = new Indicator("candlestick");
export const cci = new Indicator("cci");
export const cmo = new Indicator("cmo");
export const cvi = new Indicator("cvi");
export const dema = new Indicator("dema");
export const di = new Indicator("di");
export const dm = new Indicator("dm");
export const dpo = new Indicator("dpo");
export const dx = new Indicator("dx");
export const ema = new Indicator("ema");
export const emv = new Indicator("emv");
export const fisher = new Indicator("fisher");
export const fosc = new Indicator("fosc");
export const hma = new Indicator("hma");
export const kama = new Indicator("kama");
export const kvo = new Indicator("kvo");
export const linreg = new Indicator("linreg");
export const macd = new Indicator("macd");
export const marketfi = new Indicator("marketfi");
export const mass = new Indicator("mass");
export const max = new Indicator("max");
export const md = new Indicator("md");
export const medprice = new Indicator("medprice");
export const mfi = new Indicator("mfi");
export const min = new Indicator("min");
export const mom = new Indicator("mom");
export const msw = new Indicator("msw");
export const natr = new Indicator("natr");
export const nvi = new Indicator("nvi");
export const obv = new Indicator("obv");
export const pivotpoint = new Indicator("pivotpoint");
export const ppo = new Indicator("ppo");
export const psar = new Indicator("psar");
export const pvi = new Indicator("pvi");
export const qstick = new Indicator("qstick");
export const roc = new Indicator("roc");
export const rocr = new Indicator("rocr");
export const rsi = new Indicator("rsi");
export const sma = new Indicator("sma");
export const stddev = new Indicator("stddev");
export const stoch = new Indicator("stoch");
export const stochrsi = new Indicator("stochrsi");
export const tema = new Indicator("tema");
export const tr = new Indicator("tr");
export const trima = new Indicator("trima");
export const trix = new Indicator("trix");
export const tsf = new Indicator("tsf");
export const typprice = new Indicator("typprice");
export const ultosc = new Indicator("ultosc");
export const vhf = new Indicator("vhf");
export const vidya = new Indicator("vidya");
export const volatility = new Indicator("volatility");
export const vosc = new Indicator("vosc");
export const vwma = new Indicator("vwma");
export const wad = new Indicator("wad");
export const wcprice = new Indicator("wcprice");
export const wilders = new Indicator("wilders");
export const willr = new Indicator("willr");
export const wma = new Indicator("wma");
export const zlema = new Indicator("zlema");
