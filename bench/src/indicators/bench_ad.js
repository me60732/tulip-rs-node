import * as ti from 'tulip-rs-node';
import { ADL } from 'technicalindicators';

export const name = 'ad';
export const optionsList = [[]];

export function tulipFn(data, _options) {
  return ti.ad.indicator([data.high, data.low, data.close, data.volume], []);
}

export function refFn(data, _options) {
  return ADL.calculate({ high: data.high, low: data.low, close: data.close, volume: data.volume });
}
