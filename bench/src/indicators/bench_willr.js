import * as ti from "tulip-rs-node";
import { WilliamsR } from "technicalindicators";
import { willr } from "indicatorts";

export const name = "willr";
export const optionsList = [[14], [20], [50], [100]];

export function tulipFn(data, options) {
  return ti.willr.indicator([data.high, data.low, data.close], options);
}

export function refFn(data, options) {
  return WilliamsR.calculate({
    period: options[0],
    high: data.high,
    low: data.low,
    close: data.close,
  });
}

export function ref2Fn(data, options) {
  return willr(data.high, data.low, data.close, { period: options[0] });
}

export function simdAssetsFn(stocks, options) {
  const inputs = stocks.map((s) => [s.high, s.low, s.close]);
  return ti.willr.simdByAssets(inputs, options);
}

export function simdOptionsFn(data, optionsList) {
  return ti.willr.simdByOptions([data.high, data.low, data.close], optionsList);
}
