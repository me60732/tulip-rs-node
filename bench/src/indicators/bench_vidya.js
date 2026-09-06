import * as ti from 'tulip-rs-node';

export const name = 'vidya';
export const optionsList = [[2, 5, 0.2], [5, 14, 0.2], [8, 21, 0.2], [12, 26, 0.2]];

export function tulipFn(data, options) {
  return ti.vidya.indicator([data.close], options);
}

export const refFn = null;
export const ref2Fn = null;

export function simdAssetsFn(stocks, options) {
  const inputs = stocks.map((s) => [s.close]);
  return ti.vidya.simdByAssets(inputs, options);
}

export function simdOptionsFn(data, optionsList) {
  return ti.vidya.simdByOptions([data.close], optionsList);
}
