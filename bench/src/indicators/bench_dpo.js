import * as ti from 'tulip-rs-node';

export const name = 'dpo';
export const optionsList = [[5], [14], [20], [30]];

export function tulipFn(data, options) {
  return ti.dpo.indicator([data.close], options);
}

export const refFn = null;
export const ref2Fn = null;

export function simdAssetsFn(stocks, options) {
  const inputs = stocks.map((s) => [s.close]);
  return ti.dpo.simdByAssets(inputs, options);
}

export function simdOptionsFn(data, optionsList) {
  return ti.dpo.simdByOptions([data.close], optionsList);
}
