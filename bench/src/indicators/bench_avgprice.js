import * as ti from 'tulip-rs-node';

export const name = 'avgprice';
export const optionsList = [[]];

export function tulipFn(data, _options) {
  return ti.avgprice.indicator([data.open, data.high, data.low, data.close], []);
}

export const refFn = null;
export const ref2Fn = null;
