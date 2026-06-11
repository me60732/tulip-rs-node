import * as ti from 'tulip-rs-node';
import { bop } from 'indicatorts';

export const name = 'bop';
export const optionsList = [[]];

export function tulipFn(data, _options) {
  return ti.bop.indicator([data.open, data.high, data.low, data.close], []);
}

export const refFn = null;

export function ref2Fn(data, _options) {
  return bop(data.open, data.high, data.low, data.close);
}
