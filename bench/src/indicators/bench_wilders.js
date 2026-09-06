import * as ti from "tulip-rs-node";
import { WEMA } from "technicalindicators";
import { rma } from "indicatorts";

export const name = "wilders";
export const optionsList = [[14], [20], [50], [100]];

export function tulipFn(data, options) {
  return ti.wilders.indicator([data.close], options);
}

export function refFn(data, options) {
  return WEMA.calculate({ period: options[0], values: data.close });
}

export function ref2Fn(data, options) {
  return rma(data.close, { period: options[0] });
}

export function simdAssetsFn(stocks, options) {
  const inputs = stocks.map((s) => [s.close]);
  return ti.wilders.simdByAssets(inputs, options);
}

export function simdOptionsFn(data, optionsList) {
  return ti.wilders.simdByOptions([data.close], optionsList);
}
