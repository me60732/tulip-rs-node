import * as ti from 'tulip-rs-node';

export const name = 'wcprice';
export const optionsList = [[]];

export function tulipFn(data, _options) {
  return ti.wcprice.indicator([data.high, data.low, data.close], []);
}

export const refFn = null;
export const ref2Fn = null;

export function simdAssetsFn(stocks, _options) {
  const inputs = stocks.map((s) => [s.high, s.low, s.close]);
  return ti.wcprice.simdByAssets(inputs, []);
}
