import * as ti from 'tulip-rs-node';

export const name = 'trendmode';
export const optionsList = [[0.0], [0.05], [0.07], [0.10]];

export function tulipFn(data, options) {
  return ti.trendmode.indicator([data.close], options);
}

export const refFn = null;
export const ref2Fn = null;

export function simdAssetsFn(stocks, options) {
  const inputs = stocks.map((s) => [s.close]);
  return ti.trendmode.simdByAssets(inputs, options);
}

export function simdOptionsFn(data, optionsList) {
  return ti.trendmode.simdByOptions([data.close], optionsList);
}
