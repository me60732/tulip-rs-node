import * as ti from 'tulip-rs-node';

export const name = 'marketfi';
export const optionsList = [[]];

export function tulipFn(data, _options) {
  return ti.marketfi.indicator([data.high, data.low, data.volume], []);
}

export const refFn = null;
export const ref2Fn = null;

export function simdAssetsFn(stocks, _options) {
  const inputs = stocks.map((s) => [s.high, s.low, s.volume]);
  return ti.marketfi.simdByAssets(inputs, []);
}
