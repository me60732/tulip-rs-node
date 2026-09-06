import * as ti from 'tulip-rs-node';

export const name = 'ultosc';
export const optionsList = [[2, 5, 10], [7, 14, 28], [5, 10, 20], [4, 8, 16]];

export function tulipFn(data, options) {
  return ti.ultosc.indicator([data.high, data.low, data.close], options);
}

export const refFn = null;
export const ref2Fn = null;

export function simdAssetsFn(stocks, options) {
  const inputs = stocks.map((s) => [s.high, s.low, s.close]);
  return ti.ultosc.simdByAssets(inputs, options);
}

export function simdOptionsFn(data, optionsList) {
  return ti.ultosc.simdByOptions([data.high, data.low, data.close], optionsList);
}
