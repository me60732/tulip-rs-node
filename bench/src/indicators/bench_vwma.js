import * as ti from 'tulip-rs-node';
import { vwma } from 'indicatorts';

export const name = 'vwma';
export const optionsList = [[5], [14], [50], [200]];

export function tulipFn(data, options) {
  return ti.vwma.indicator([data.close, data.volume], options);
}

export const refFn = null;

export function ref2Fn(data, options) {
  return vwma(data.close, data.volume, { period: options[0] });
}

export function simdAssetsFn(stocks, options) {
  const inputs = stocks.map((s) => [s.close, s.volume]);
  return ti.vwma.simdByAssets(inputs, options);
}

export function simdOptionsFn(data, optionsList) {
  return ti.vwma.simdByOptions([data.close, data.volume], optionsList);
}
