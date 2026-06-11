import * as ti from 'tulip-rs-node';
import { trima } from 'indicatorts';

export const name = 'trima';
export const optionsList = [[5], [14], [50], [200]];

export function tulipFn(data, options) {
  return ti.trima.indicator([data.close], options);
}

export const refFn = null;

export function ref2Fn(data, options) {
  return trima(data.close, { period: options[0] });
}
