import * as ti from "tulip-rs-node";
import { PSAR } from "technicalindicators";

export const name = "psar";
export const optionsList = [
  [0.02, 0.2],
  [0.01, 0.1],
  [0.03, 0.3],
  [0.05, 0.5],
];

export function tulipFn(data, options) {
  return ti.psar.indicator([data.high, data.low], options);
}

export function refFn(data, options) {
  return PSAR.calculate({
    step: options[0],
    max: options[1],
    high: data.high,
    low: data.low,
  });
}
