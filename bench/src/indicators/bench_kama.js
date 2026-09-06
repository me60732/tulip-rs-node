import * as ti from 'tulip-rs-node';

export const name = 'kama';
export const optionsList = [[5], [14], [50], [200]];

export function tulipFn(data, options) {
  return ti.kama.indicator([data.close], options);
}

export const refFn = null;
export const ref2Fn = null;

export function simdAssetsFn(stocks, options) {
  const inputs = stocks.map((s) => [s.close]);
  return ti.kama.simdByAssets(inputs, options);
}

export function simdOptionsFn(data, optionsList) {
  return ti.kama.simdByOptions([data.close], optionsList);
}
