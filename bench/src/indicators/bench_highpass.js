import * as ti from 'tulip-rs-node';

export const name = 'highpass';
export const optionsList = [[20], [40], [60], [80]];

export function tulipFn(data, options) {
  return ti.highpass.indicator([data.close], options);
}

export const refFn = null;
export const ref2Fn = null;

export function simdAssetsFn(stocks, options) {
  const inputs = stocks.map((s) => [s.close]);
  return ti.highpass.simdByAssets(inputs, options);
}

export function simdOptionsFn(data, optionsList) {
  return ti.highpass.simdByOptions([data.close], optionsList);
}
