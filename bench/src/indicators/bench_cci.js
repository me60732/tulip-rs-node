import * as ti from "tulip-rs-node";
import { CCI } from "technicalindicators";
import { cci } from "indicatorts";

export const name = "cci";
export const optionsList = [[14], [20], [40], [100]];

export function tulipFn(data, options) {
  return ti.cci.indicator([data.high, data.low, data.close], options);
}

export function refFn(data, options) {
  return CCI.calculate({
    period: options[0],
    high: data.high,
    low: data.low,
    close: data.close,
  });
}

export function ref2Fn(data, options) {
  return cci(data.high, data.low, data.close, { period: options[0] });
}

export function simdAssetsFn(stocks, options) {
  const inputs = stocks.map((s) => [s.high, s.low, s.close]);
  return ti.cci.simdByAssets(inputs, options);
}

export function simdOptionsFn(data, optionsList) {
  return ti.cci.simdByOptions([data.high, data.low, data.close], optionsList);
}
