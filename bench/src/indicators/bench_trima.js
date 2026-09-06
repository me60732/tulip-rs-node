import * as ti from 'tulip-rs-node';
import { trima } from 'indicatorts';

export const name = 'trima';
export const optionsList = [[5], [14], [50], [200]];

export function tulipFn(data, options) {
  return ti.trima.indicator([data.close], options);
}

export const refFn = null;

export function ref2Fn(data, options) {
  return trima(data.close, { period: options[0] });
}

export function simdAssetsFn(stocks, options) {
  const inputs = stocks.map((s) => [s.close]);
  return ti.trima.simdByAssets(inputs, options);
}

export function simdOptionsFn(data, optionsList) {
  return ti.trima.simdByOptions([data.close], optionsList);
}
