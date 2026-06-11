import * as ti from 'tulip-rs-node';
import { apo } from 'indicatorts';

export const name = 'apo';
export const optionsList = [[2, 5], [5, 35], [8, 21], [12, 26]];

export function tulipFn(data, options) {
  return ti.apo.indicator([data.close], options);
}

export const refFn = null;

export function ref2Fn(data, options) {
  return apo(data.close, { fast: options[0], slow: options[1] });
}
