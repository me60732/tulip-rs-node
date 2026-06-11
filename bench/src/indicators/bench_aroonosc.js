import * as ti from 'tulip-rs-node';

export const name = 'aroonosc';
export const optionsList = [[5], [14], [20], [30]];

export function tulipFn(data, options) {
  return ti.aroonosc.indicator([data.high, data.low], options);
}

export const refFn = null;
export const ref2Fn = null;
