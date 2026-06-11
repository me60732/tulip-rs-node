import * as ti from "tulip-rs-node";
import { BollingerBands } from "technicalindicators";
import { bb } from "indicatorts";

export const name = "bbands";
export const optionsList = [
  [20, 2],
  [50, 2],
  [20, 2.5],
  [100, 2],
];

export function tulipFn(data, options) {
  return ti.bbands.indicator([data.close], options);
}

export function refFn(data, options) {
  return BollingerBands.calculate({
    period: options[0],
    stdDev: options[1],
    values: data.close,
  });
}

// Note: indicatorts bb always uses 2× std; options[1] (stdDev multiplier) is not supported.
export function ref2Fn(data, options) {
  return bb(data.close, { period: options[0] });
}
