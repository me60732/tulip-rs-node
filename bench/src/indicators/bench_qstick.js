import * as ti from 'tulip-rs-node';
import { qstick } from 'indicatorts';

export const name = 'qstick';
export const optionsList = [[5], [14], [20], [30]];

export function tulipFn(data, options) {
  return ti.qstick.indicator([data.open, data.close], options);
}

export const refFn = null;

export function ref2Fn(data, options) {
  return qstick(data.open, data.close, { period: options[0] });
}

export function simdAssetsFn(stocks, options) {
  const inputs = stocks.map((s) => [s.open, s.close]);
  return ti.qstick.simdByAssets(inputs, options);
}

export function simdOptionsFn(data, optionsList) {
  return ti.qstick.simdByOptions([data.open, data.close], optionsList);
}
