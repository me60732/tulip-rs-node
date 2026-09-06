import * as ti from 'tulip-rs-node';

export const name = 'hilberttransform';
export const optionsList = [[10, 20], [15, 30], [20, 40], [25, 50]];

export function tulipFn(data, options) {
  return ti.hilberttransform.indicator([data.close], options);
}

export const refFn = null;
export const ref2Fn = null;

export function simdAssetsFn(stocks, options) {
  const inputs = stocks.map((s) => [s.close]);
  return ti.hilberttransform.simdByAssets(inputs, options);
}

export function simdOptionsFn(data, optionsList) {
  return ti.hilberttransform.simdByOptions([data.close], optionsList);
}
