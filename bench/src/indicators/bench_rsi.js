import * as ti from 'tulip-rs-node';
import { RSI } from 'technicalindicators';

export const name = 'rsi';
export const optionsList = [[14], [20], [25], [30]];

export function tulipFn(data, options) {
  return ti.rsi.indicator([data.close], options);
}

export function refFn(data, options) {
  return RSI.calculate({ period: options[0], values: data.close });
}
