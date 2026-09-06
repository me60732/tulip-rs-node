import * as ti from 'tulip-rs-node';

export const name = 'pvi';
export const optionsList = [[]];

export function tulipFn(data, _options) {
  return ti.pvi.indicator([data.close, data.volume], []);
}

export const refFn = null;
export const ref2Fn = null;

export function simdAssetsFn(stocks, _options) {
  const inputs = stocks.map((s) => [s.close, s.volume]);
  return ti.pvi.simdByAssets(inputs, []);
}
