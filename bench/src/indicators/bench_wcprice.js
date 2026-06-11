import * as ti from 'tulip-rs-node';

export const name = 'wcprice';
export const optionsList = [[]];

export function tulipFn(data, _options) {
  return ti.wcprice.indicator([data.high, data.low, data.close], []);
}

export const refFn = null;
export const ref2Fn = null;
