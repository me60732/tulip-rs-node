import * as ti from 'tulip-rs-node';

export const name = 'smaenvelope';
export const optionsList = [[10, 2], [20, 2], [50, 2], [100, 2]];

export function tulipFn(data, options) {
  return ti.smaenvelope.indicator([data.close], options);
}

export const refFn = null;
export const ref2Fn = null;

export function simdAssetsFn(stocks, options) {
  const inputs = stocks.map((s) => [s.close]);
  return ti.smaenvelope.simdByAssets(inputs, options);
}

export function simdOptionsFn(data, optionsList) {
  return ti.smaenvelope.simdByOptions([data.close], optionsList);
}
