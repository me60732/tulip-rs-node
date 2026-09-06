import * as ti from "tulip-rs-node";
import { ATR } from "technicalindicators";
import { atr } from "indicatorts";

export const name = "atr";
export const optionsList = [[5], [14], [24], [30]];

export function tulipFn(data, options) {
  return ti.atr.indicator([data.high, data.low, data.close], options);
}

export function refFn(data, options) {
  return ATR.calculate({
    period: options[0],
    high: data.high,
    low: data.low,
    close: data.close,
  });
}

export function ref2Fn(data, options) {
  return atr(data.high, data.low, data.close, { period: options[0] });
}

export function simdAssetsFn(stocks, options) {
  const inputs = stocks.map((s) => [s.high, s.low, s.close]);
  return ti.atr.simdByAssets(inputs, options);
}

export function simdOptionsFn(data, optionsList) {
  return ti.atr.simdByOptions([data.high, data.low, data.close], optionsList);
}
