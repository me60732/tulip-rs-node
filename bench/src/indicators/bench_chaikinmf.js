import * as ti from 'tulip-rs-node';
import { cmf } from 'indicatorts';

export const name = 'chaikinmf';
export const optionsList = [[14], [20], [40], [100]];

export function tulipFn(data, options) {
  return ti.chaikinmf.indicator([data.high, data.low, data.close, data.volume], options);
}

export const refFn = null;

export function ref2Fn(data, options) {
  return cmf(data.high, data.low, data.close, data.volume, { period: options[0] });
}

export function simdAssetsFn(stocks, options) {
  const inputs = stocks.map((s) => [s.high, s.low, s.close, s.volume]);
  return ti.chaikinmf.simdByAssets(inputs, options);
}

export function simdOptionsFn(data, optionsList) {
  return ti.chaikinmf.simdByOptions([data.high, data.low, data.close, data.volume], optionsList);
}
