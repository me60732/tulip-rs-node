import * as ti from 'tulip-rs-node';

export const name = 'trendmode';
export const optionsList = [[0.0], [0.05], [0.07], [0.10]];

export function tulipFn(data, options) {
  return ti.trendmode.indicator([data.close], options);
}

export const refFn = null;
export const ref2Fn = null;
