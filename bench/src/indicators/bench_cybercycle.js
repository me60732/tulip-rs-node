import * as ti from 'tulip-rs-node';

export const name = 'cybercycle';
export const optionsList = [[0.05], [0.07], [0.10], [0.15]];

export function tulipFn(data, options) {
  return ti.cybercycle.indicator([data.close], options);
}

export const refFn = null;
export const ref2Fn = null;

export function simdAssetsFn(stocks, options) {
  const inputs = stocks.map((s) => [s.close]);
  return ti.cybercycle.simdByAssets(inputs, options);
}

export function simdOptionsFn(data, optionsList) {
  return ti.cybercycle.simdByOptions([data.close], optionsList);
}
