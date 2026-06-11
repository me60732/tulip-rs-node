import * as ti from 'tulip-rs-node';
import { dema } from 'indicatorts';

export const name = 'dema';
export const optionsList = [[5], [14], [50], [200]];

export function tulipFn(data, options) {
  return ti.dema.indicator([data.close], options);
}

export const refFn = null;

export function ref2Fn(data, options) {
  return dema(data.close, { period: options[0] });
}
