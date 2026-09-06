import * as ti from 'tulip-rs-node';

export const name = 'elderray';
export const optionsList = [[5], [14], [20], [30]];

export function tulipFn(data, options) {
  return ti.elderray.indicator([data.high, data.low, data.close], options);
}

export const refFn = null;
export const ref2Fn = null;

export function simdAssetsFn(stocks, options) {
  const inputs = stocks.map((s) => [s.high, s.low, s.close]);
  return ti.elderray.simdByAssets(inputs, options);
}

export function simdOptionsFn(data, optionsList) {
  return ti.elderray.simdByOptions([data.high, data.low, data.close], optionsList);
}
