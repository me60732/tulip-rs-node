import * as ti from 'tulip-rs-node';

export const name = 'hma';
export const optionsList = [[5], [14], [50], [200]];

export function tulipFn(data, options) {
  return ti.hma.indicator([data.close], options);
}

export const refFn = null;
export const ref2Fn = null;
