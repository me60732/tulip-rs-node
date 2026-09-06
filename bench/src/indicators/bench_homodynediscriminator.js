import * as ti from 'tulip-rs-node';

export const name = 'homodynediscriminator';
export const optionsList = [[]];

export function tulipFn(data, options) {
  return ti.homodynediscriminator.indicator([data.close], []);
}

export const refFn = null;
export const ref2Fn = null;

export function simdAssetsFn(stocks, _options) {
  const inputs = stocks.map((s) => [s.close]);
  return ti.homodynediscriminator.simdByAssets(inputs, []);
}
