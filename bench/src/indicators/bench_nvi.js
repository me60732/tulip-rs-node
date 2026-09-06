import * as ti from 'tulip-rs-node';
import { nvi } from 'indicatorts';

export const name = 'nvi';
export const optionsList = [[]];

export function tulipFn(data, _options) {
  return ti.nvi.indicator([data.close, data.volume], []);
}

export const refFn = null;

export function ref2Fn(data, _options) {
  return nvi(data.close, data.volume);
}

export function simdAssetsFn(stocks, _options) {
  const inputs = stocks.map((s) => [s.close, s.volume]);
  return ti.nvi.simdByAssets(inputs, []);
}
