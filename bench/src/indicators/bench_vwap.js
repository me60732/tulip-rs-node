import * as ti from 'tulip-rs-node';
import { VWAP } from 'technicalindicators';

export const name = 'vwap';
export const optionsList = [[]];

export function tulipFn(data, options) {
  return ti.vwap.indicator([data.high, data.low, data.close, data.volume], []);
}

export function refFn(data, options) {
  return VWAP.calculate({
    high: Array.from(data.high),
    low: Array.from(data.low),
    close: Array.from(data.close),
    volume: Array.from(data.volume),
  });
}

export const ref2Fn = null;
