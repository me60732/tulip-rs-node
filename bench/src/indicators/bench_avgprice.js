import * as ti from 'tulip-rs-node';

export const name = 'avgprice';
export const optionsList = [[]];

export function tulipFn(data, _options) {
  return ti.avgprice.indicator([data.open, data.high, data.low, data.close], []);
}

export const refFn = null;
export const ref2Fn = null;

export function simdAssetsFn(stocks, _options) {
  const inputs = stocks.map((s) => [s.open, s.high, s.low, s.close]);
  return ti.avgprice.simdByAssets(inputs, []);
}
