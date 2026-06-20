import * as ti from 'tulip-rs-node';

export const name = 'mama';
export const optionsList = [[0.5, 0.05], [0.4, 0.04], [0.6, 0.06], [0.7, 0.07]];

export function tulipFn(data, options) {
  return ti.mama.indicator([data.close], options);
}

export const refFn = null;
export const ref2Fn = null;
