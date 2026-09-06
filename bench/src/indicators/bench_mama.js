import * as ti from 'tulip-rs-node';

export const name = 'mama';
export const optionsList = [[0.5, 0.05], [0.4, 0.04], [0.6, 0.06], [0.7, 0.07]];

export function tulipFn(data, options) {
  return ti.mama.indicator([data.close], options);
}

export const refFn = null;
export const ref2Fn = null;

export function simdAssetsFn(stocks, options) {
  const inputs = stocks.map((s) => [s.close]);
  return ti.mama.simdByAssets(inputs, options);
}

export function simdOptionsFn(data, optionsList) {
  return ti.mama.simdByOptions([data.close], optionsList);
}
