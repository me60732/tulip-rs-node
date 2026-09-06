import * as ti from 'tulip-rs-node';
import { mmin } from 'indicatorts';

export const name = 'min';
export const optionsList = [[50], [100], [200], [300]];

export function tulipFn(data, options) {
  return ti.min.indicator([data.close], options);
}

export const refFn = null;

export function ref2Fn(data, options) {
  return mmin(data.close, { period: options[0] });
}

export function simdAssetsFn(stocks, options) {
  const inputs = stocks.map((s) => [s.close]);
  return ti.min.simdByAssets(inputs, options);
}

export function simdOptionsFn(data, optionsList) {
  return ti.min.simdByOptions([data.close], optionsList);
}
