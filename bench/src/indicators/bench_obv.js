import * as ti from "tulip-rs-node";
import { OBV } from "technicalindicators";
import { obv } from "indicatorts";

export const name = "obv";
export const optionsList = [[]];

export function tulipFn(data, _options) {
  return ti.obv.indicator([data.close, data.volume], []);
}

export function refFn(data, _options) {
  return OBV.calculate({ close: data.close, volume: data.volume });
}

export function ref2Fn(data, _options) {
  return obv(data.close, data.volume);
}
