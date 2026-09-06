import * as ti from 'tulip-rs-node';

export const name = 'supertrend';
export const optionsList = [[7, 3], [5, 2], [10, 2.5], [14, 2]];

export function tulipFn(data, options) {
  return ti.supertrend.indicator([data.high, data.low, data.close], options);
}

export const refFn = null;
export const ref2Fn = null;

export function simdAssetsFn(stocks, options) {
  const inputs = stocks.map((s) => [s.high, s.low, s.close]);
  return ti.supertrend.simdByAssets(inputs, options);
}

export function simdOptionsFn(data, optionsList) {
  return ti.supertrend.simdByOptions([data.high, data.low, data.close], optionsList);
}
