import * as ti from "tulip-rs-node";
import { EMA } from "technicalindicators";
import { ema } from "indicatorts";

export const name = "ema";
export const optionsList = [[50], [100], [200], [300]];

export function tulipFn(data, options) {
  return ti.ema.indicator([data.close], options);
}

export function refFn(data, options) {
  return EMA.calculate({ period: options[0], values: data.close });
}

export function ref2Fn(data, options) {
  return ema(data.close, { period: options[0] });
}

export function simdAssetsFn(stocks, options) {
  const inputs = stocks.map((s) => [s.close]);
  return ti.ema.simdByAssets(inputs, options);
}

export function simdOptionsFn(data, optionsList) {
  return ti.ema.simdByOptions([data.close], optionsList);
}
