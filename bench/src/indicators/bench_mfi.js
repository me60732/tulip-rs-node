import * as ti from "tulip-rs-node";
import { MFI } from "technicalindicators";
import { mfi } from "indicatorts";

export const name = "mfi";
export const optionsList = [[14], [20], [40], [100]];

export function tulipFn(data, options) {
  return ti.mfi.indicator(
    [data.high, data.low, data.close, data.volume],
    options,
  );
}

export function refFn(data, options) {
  return MFI.calculate({
    period: options[0],
    high: data.high,
    low: data.low,
    close: data.close,
    volume: data.volume,
  });
}

export function ref2Fn(data, options) {
  return mfi(data.high, data.low, data.close, data.volume, {
    period: options[0],
  });
}
