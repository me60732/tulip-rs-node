import * as ti from "tulip-rs-node";
import { ROC } from "technicalindicators";
import { roc } from "indicatorts";

export const name = "roc";
export const optionsList = [[10], [14], [20], [50]];

export function tulipFn(data, options) {
  return ti.roc.indicator([data.close], options);
}

export function refFn(data, options) {
  return ROC.calculate({ period: options[0], values: data.close });
}

export function ref2Fn(data, options) {
  return roc(data.close, { period: options[0] });
}
