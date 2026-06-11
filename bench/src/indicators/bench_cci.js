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
