import * as ti from 'tulip-rs-node';

export const name = 'ultosc';
export const optionsList = [[2, 5, 10], [7, 14, 28], [5, 10, 20], [4, 8, 16]];

export function tulipFn(data, options) {
  return ti.ultosc.indicator([data.high, data.low, data.close], options);
}

export const refFn = null;
export const ref2Fn = null;
