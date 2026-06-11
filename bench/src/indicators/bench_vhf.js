import * as ti from 'tulip-rs-node';

export const name = 'vhf';
export const optionsList = [[5], [14], [20], [30]];

export function tulipFn(data, options) {
  return ti.vhf.indicator([data.close], options);
}

export const refFn = null;
export const ref2Fn = null;
