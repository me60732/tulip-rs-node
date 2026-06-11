import * as ti from 'tulip-rs-node';
import { typprice } from 'indicatorts';

export const name = 'typprice';
export const optionsList = [[]];

export function tulipFn(data, _options) {
  return ti.typprice.indicator([data.high, data.low, data.close], []);
}

export const refFn = null;

export function ref2Fn(data, _options) {
  return typprice(data.high, data.low, data.close);
}
