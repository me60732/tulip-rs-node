import * as ti from 'tulip-rs-node';

export const name = 'smaenvelope';
export const optionsList = [[10, 2], [20, 2], [50, 2], [100, 2]];

export function tulipFn(data, options) {
  return ti.smaenvelope.indicator([data.close], options);
}

export const refFn = null;
export const ref2Fn = null;
