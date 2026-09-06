import * as ti from 'tulip-rs-node';

export const name = 'vhf';
export const optionsList = [[5], [14], [20], [30]];

export function tulipFn(data, options) {
  return ti.vhf.indicator([data.close], options);
}

export const refFn = null;
export const ref2Fn = null;

export function simdAssetsFn(stocks, options) {
  const inputs = stocks.map((s) => [s.close]);
  return ti.vhf.simdByAssets(inputs, options);
}

export function simdOptionsFn(data, optionsList) {
  return ti.vhf.simdByOptions([data.close], optionsList);
}
