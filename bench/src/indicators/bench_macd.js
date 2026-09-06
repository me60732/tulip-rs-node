import * as ti from "tulip-rs-node";
import { MACD } from "technicalindicators";
import { macd } from "indicatorts";

export const name = "macd";
export const optionsList = [
  [12, 26, 9],
  [5, 35, 5],
  [8, 21, 5],
  [3, 10, 9],
];

export function tulipFn(data, options) {
  return ti.macd.indicator([data.close], options);
}

export function refFn(data, options) {
  return MACD.calculate({
    fastPeriod: options[0],
    slowPeriod: options[1],
    signalPeriod: options[2],
    values: data.close,
    SimpleMAOscillator: false,
    SimpleMASignal: false,
  });
}

export function ref2Fn(data, options) {
  return macd(data.close, {
    fast: options[0],
    slow: options[1],
    signal: options[2],
  });
}

export function simdAssetsFn(stocks, options) {
  const inputs = stocks.map((s) => [s.close]);
  return ti.macd.simdByAssets(inputs, options);
}

export function simdOptionsFn(data, optionsList) {
  return ti.macd.simdByOptions([data.close], optionsList);
}
