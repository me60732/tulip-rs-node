import * as ti from 'tulip-rs-node';
import { ATR } from 'technicalindicators';

export const name = 'atr';
export const optionsList = [[5], [14], [24], [30]];

export function tulipFn(data, options) {
  return ti.atr.indicator([data.high, data.low, data.close], options);
}

export function refFn(data, options) {
  return ATR.calculate({ period: options[0], high: data.high, low: data.low, close: data.close });
}
