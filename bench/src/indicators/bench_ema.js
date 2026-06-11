import * as ti from "tulip-rs-node";
import { EMA } from "technicalindicators";

export const name = "ema";
export const optionsList = [[50], [100], [200], [300]];

export function tulipFn(data, options) {
  return ti.ema.indicator([data.close], options);
}

export function refFn(data, options) {
  return EMA.calculate({ period: options[0], values: data.close });
}
