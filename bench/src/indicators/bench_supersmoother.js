import * as ti from 'tulip-rs-node';

export const name = 'supersmoother';
export const optionsList = [[10], [20], [30], [40]];

export function tulipFn(data, options) {
  return ti.supersmoother.indicator([data.close], options);
}

export const refFn = null;
export const ref2Fn = null;
