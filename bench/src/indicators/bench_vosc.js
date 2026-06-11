import * as ti from 'tulip-rs-node';

export const name = 'vosc';
export const optionsList = [[2, 5], [5, 35], [8, 21], [12, 26]];

export function tulipFn(data, options) {
  return ti.vosc.indicator([data.volume], options);
}

export const refFn = null;
export const ref2Fn = null;
