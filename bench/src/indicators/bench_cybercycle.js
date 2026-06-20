import * as ti from 'tulip-rs-node';

export const name = 'cybercycle';
export const optionsList = [[0.05], [0.07], [0.10], [0.15]];

export function tulipFn(data, options) {
  return ti.cybercycle.indicator([data.close], options);
}

export const refFn = null;
export const ref2Fn = null;
