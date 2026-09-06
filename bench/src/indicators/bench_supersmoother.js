import * as ti from 'tulip-rs-node';

export const name = 'supersmoother';
export const optionsList = [[10], [20], [30], [40]];

export function tulipFn(data, options) {
  return ti.supersmoother.indicator([data.close], options);
}

export const refFn = null;
export const ref2Fn = null;

export function simdAssetsFn(stocks, options) {
  const inputs = stocks.map((s) => [s.close]);
  return ti.supersmoother.simdByAssets(inputs, options);
}

export function simdOptionsFn(data, optionsList) {
  return ti.supersmoother.simdByOptions([data.close], optionsList);
}
