import * as ti from 'tulip-rs-node';

export const name = 'supertrend';
export const optionsList = [[7, 3], [5, 2], [10, 2.5], [14, 2]];

export function tulipFn(data, options) {
  return ti.supertrend.indicator([data.high, data.low, data.close], options);
}

export const refFn = null;
export const ref2Fn = null;
