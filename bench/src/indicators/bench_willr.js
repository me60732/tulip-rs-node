import * as ti from 'tulip-rs-node';
import { WilliamsR } from 'technicalindicators';

export const name = 'willr';
export const optionsList = [[14], [20], [50], [100]];

export function tulipFn(data, options) {
  return ti.willr.indicator([data.high, data.low, data.close], options);
}

export function refFn(data, options) {
  return WilliamsR.calculate({ period: options[0], high: data.high, low: data.low, close: data.close });
}
