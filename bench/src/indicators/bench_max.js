import * as ti from 'tulip-rs-node';
import { mmax } from 'indicatorts';

export const name = 'max';
export const optionsList = [[50], [100], [200], [300]];

export function tulipFn(data, options) {
  return ti.max.indicator([data.close], options);
}

export const refFn = null;

export function ref2Fn(data, options) {
  return mmax(data.close, { period: options[0] });
}
