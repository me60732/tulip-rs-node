import * as ti from 'tulip-rs-node';

export const name = 'di';
export const optionsList = [[5], [14], [20], [30]];

export function tulipFn(data, options) {
  return ti.di.indicator([data.high, data.low, data.close], options);
}

export const refFn = null;
export const ref2Fn = null;

export function simdAssetsFn(stocks, options) {
  const inputs = stocks.map((s) => [s.high, s.low, s.close]);
  return ti.di.simdByAssets(inputs, options);
}

export function simdOptionsFn(data, optionsList) {
  return ti.di.simdByOptions([data.high, data.low, data.close], optionsList);
}
