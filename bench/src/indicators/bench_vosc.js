import * as ti from 'tulip-rs-node';

export const name = 'vosc';
export const optionsList = [[2, 5], [5, 35], [8, 21], [12, 26]];

export function tulipFn(data, options) {
  return ti.vosc.indicator([data.volume], options);
}

export const refFn = null;
export const ref2Fn = null;

export function simdAssetsFn(stocks, options) {
  const inputs = stocks.map((s) => [s.volume]);
  return ti.vosc.simdByAssets(inputs, options);
}

export function simdOptionsFn(data, optionsList) {
  return ti.vosc.simdByOptions([data.volume], optionsList);
}
