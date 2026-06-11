import * as ti from 'tulip-rs-node';

export const name = 'linreg';
export const optionsList = [[5], [14], [20], [50]];

export function tulipFn(data, options) {
  return ti.linreg.indicator([data.close], options);
}

export const refFn = null;
export const ref2Fn = null;
