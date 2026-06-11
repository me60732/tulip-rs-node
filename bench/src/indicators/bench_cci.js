import * as ti from 'tulip-rs-node';
import { CCI } from 'technicalindicators';

export const name = 'cci';
export const optionsList = [[14], [20], [40], [100]];

export function tulipFn(data, options) {
  return ti.cci.indicator([data.high, data.low, data.close], options);
}

export function refFn(data, options) {
  return CCI.calculate({ period: options[0], high: data.high, low: data.low, close: data.close });
}
