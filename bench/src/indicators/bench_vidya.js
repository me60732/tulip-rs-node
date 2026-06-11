import * as ti from 'tulip-rs-node';

export const name = 'vidya';
export const optionsList = [[2, 5, 0.2], [5, 14, 0.2], [8, 21, 0.2], [12, 26, 0.2]];

export function tulipFn(data, options) {
  return ti.vidya.indicator([data.close], options);
}

export const refFn = null;
export const ref2Fn = null;
