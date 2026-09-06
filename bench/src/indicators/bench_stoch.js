import * as ti from "tulip-rs-node";
import { Stochastic } from "technicalindicators";
import { stoch } from "indicatorts";

export const name = "stoch";
export const optionsList = [
  [14, 3, 3],
  [5, 3, 3],
  [9, 3, 3],
  [20, 5, 5],
];

export function tulipFn(data, options) {
  return ti.stoch.indicator([data.high, data.low, data.close], options);
}

export function refFn(data, options) {
  return Stochastic.calculate({
    period: options[0],
    signalPeriod: options[2],
    high: data.high,
    low: data.low,
    close: data.close,
  });
}

// Note: indicatorts stoch has no slowing period; options[1] (k_slowing) is not used.
export function ref2Fn(data, options) {
  return stoch(data.high, data.low, data.close, {
    kPeriod: options[0],
    dPeriod: options[2],
  });
}

export function simdAssetsFn(stocks, options) {
  const inputs = stocks.map((s) => [s.high, s.low, s.close]);
  return ti.stoch.simdByAssets(inputs, options);
}

export function simdOptionsFn(data, optionsList) {
  return ti.stoch.simdByOptions([data.high, data.low, data.close], optionsList);
}
