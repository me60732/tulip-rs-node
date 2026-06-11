import * as ti from 'tulip-rs-node';
import { tr } from 'indicatorts';

export const name = 'tr';
export const optionsList = [[]];

export function tulipFn(data, _options) {
  return ti.tr.indicator([data.high, data.low, data.close], []);
}

export const refFn = null;

export function ref2Fn(data, _options) {
  return tr(data.high, data.low, data.close);
}
