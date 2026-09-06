import * as ti from 'tulip-rs-node';

export const name = 'kvo';
export const optionsList = [[2, 5], [5, 35], [8, 21], [12, 26]];

export function tulipFn(data, options) {
  return ti.kvo.indicator([data.high, data.low, data.close, data.volume], options);
}

export const refFn = null;
export const ref2Fn = null;

export function simdAssetsFn(stocks, options) {
  const inputs = stocks.map((s) => [s.high, s.low, s.close, s.volume]);
  return ti.kvo.simdByAssets(inputs, options);
}

export function simdOptionsFn(data, optionsList) {
  return ti.kvo.simdByOptions([data.high, data.low, data.close, data.volume], optionsList);
}
