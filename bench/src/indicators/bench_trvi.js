import * as ti from 'tulip-rs-node';

export const name = 'trvi';
export const optionsList = [[5], [14], [20], [30]];

export function tulipFn(data, options) {
  return ti.trvi.indicator([data.high, data.low, data.close], options);
}

export const refFn = null;
export const ref2Fn = null;
