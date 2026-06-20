import * as ti from 'tulip-rs-node';

export const name = 'highpass';
export const optionsList = [[20], [40], [60], [80]];

export function tulipFn(data, options) {
  return ti.highpass.indicator([data.close], options);
}

export const refFn = null;
export const ref2Fn = null;
