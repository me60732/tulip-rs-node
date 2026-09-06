import * as ti from 'tulip-rs-node';
import { aroon } from 'indicatorts';

export const name = 'aroon';
export const optionsList = [[5], [14], [20], [30]];

export function tulipFn(data, options) {
  return ti.aroon.indicator([data.high, data.low], options);
}

export const refFn = null;

export function ref2Fn(data, options) {
  return aroon(data.high, data.low, { period: options[0] });
}

export function simdAssetsFn(stocks, options) {
  const inputs = stocks.map((s) => [s.high, s.low]);
  return ti.aroon.simdByAssets(inputs, options);
}

export function simdOptionsFn(data, optionsList) {
  return ti.aroon.simdByOptions([data.high, data.low], optionsList);
}
