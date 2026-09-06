import * as ti from 'tulip-rs-node';
import { vortex } from 'indicatorts';

export const name = 'vortex';
export const optionsList = [[5], [14], [20], [30]];

export function tulipFn(data, options) {
  return ti.vortex.indicator([data.high, data.low, data.close], options);
}

export const refFn = null;

export function ref2Fn(data, options) {
  return vortex(data.high, data.low, data.close, { period: options[0] });
}

export function simdAssetsFn(stocks, options) {
  const inputs = stocks.map((s) => [s.high, s.low, s.close]);
  return ti.vortex.simdByAssets(inputs, options);
}

export function simdOptionsFn(data, optionsList) {
  return ti.vortex.simdByOptions([data.high, data.low, data.close], optionsList);
}
