import * as ti from "tulip-rs-node";
import { SMA } from "technicalindicators";
import { sma } from "indicatorts";

export const name = "sma";
export const optionsList = [[50], [100], [200], [300]];

export function tulipFn(data, options) {
  return ti.sma.indicator([data.close], options);
}

export function refFn(data, options) {
  return SMA.calculate({ period: options[0], values: data.close });
}

export function ref2Fn(data, options) {
  return sma(data.close, { period: options[0] });
}
