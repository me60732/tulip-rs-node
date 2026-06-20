import * as ti from 'tulip-rs-node';

export const name = 'hilberttransform';
export const optionsList = [[10, 20], [15, 30], [20, 40], [25, 50]];

export function tulipFn(data, options) {
  return ti.hilberttransform.indicator([data.close], options);
}

export const refFn = null;
export const ref2Fn = null;
