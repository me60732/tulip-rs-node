import * as ti from 'tulip-rs-node';
import { tr } from 'indicatorts';

export const name = 'tr';
export const optionsList = [[]];

export function tulipFn(data, _options) {
  return ti.tr.indicator([data.high, data.low, data.close], []);
}

export const refFn = null;

export function ref2Fn(data, _options) {
  return tr(data.high, data.low, data.close);
}

export function simdAssetsFn(stocks, _options) {
  const inputs = stocks.map((s) => [s.high, s.low, s.close]);
  return ti.tr.simdByAssets(inputs, []);
}
