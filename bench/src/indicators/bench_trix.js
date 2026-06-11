import * as ti from 'tulip-rs-node';
import { TRIX } from 'technicalindicators';

export const name = 'trix';
export const optionsList = [[14], [18], [20], [30]];

export function tulipFn(data, options) {
  return ti.trix.indicator([data.close], options);
}

export function refFn(data, options) {
  return TRIX.calculate({ period: options[0], values: data.close });
}
