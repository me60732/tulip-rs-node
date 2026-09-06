import * as ti from 'tulip-rs-node';

export const name = 'cvi';
export const optionsList = [[5], [14], [20], [30]];

export function tulipFn(data, options) {
  return ti.cvi.indicator([data.high, data.low], options);
}

export const refFn = null;
export const ref2Fn = null;

export function simdAssetsFn(stocks, options) {
  const inputs = stocks.map((s) => [s.high, s.low]);
  return ti.cvi.simdByAssets(inputs, options);
}

export function simdOptionsFn(data, optionsList) {
  return ti.cvi.simdByOptions([data.high, data.low], optionsList);
}
