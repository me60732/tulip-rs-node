import * as ti from 'tulip-rs-node';

export const name = 'medprice';
export const optionsList = [[]];

export function tulipFn(data, _options) {
  return ti.medprice.indicator([data.high, data.low], []);
}

export const refFn = null;
export const ref2Fn = null;
