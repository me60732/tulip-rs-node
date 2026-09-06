import * as ti from "tulip-rs-node";
import { AwesomeOscillator } from "technicalindicators";
import { ao } from "indicatorts";

export const name = "ao";
export const optionsList = [[]];

export function tulipFn(data, _options) {
  return ti.ao.indicator([data.high, data.low], []);
}

export function refFn(data, _options) {
  return AwesomeOscillator.calculate({
    fastPeriod: 5,
    slowPeriod: 34,
    high: data.high,
    low: data.low,
  });
}

export function ref2Fn(data, _options) {
  return ao(data.high, data.low);
}

export function simdAssetsFn(stocks, _options) {
  const inputs = stocks.map((s) => [s.high, s.low]);
  return ti.ao.simdByAssets(inputs, []);
}
