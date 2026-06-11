import * as ti from 'tulip-rs-node';

export const name = 'ef';
export const optionsList = [[5], [14], [20], [30]];

export function tulipFn(data, options) {
  return ti.ef.indicator([data.close], options);
}

export const refFn = null;
export const ref2Fn = null;
