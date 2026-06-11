import * as ti from 'tulip-rs-node';

export const name = 'kvo';
export const optionsList = [[2, 5], [5, 35], [8, 21], [12, 26]];

export function tulipFn(data, options) {
  return ti.kvo.indicator([data.high, data.low, data.close, data.volume], options);
}

export const refFn = null;
export const ref2Fn = null;
