import * as ti from 'tulip-rs-node';
import { ADX } from 'technicalindicators';

export const name = 'adx';
export const optionsList = [[5], [14], [24], [30]];

export function tulipFn(data, options) {
  return ti.adx.indicator([data.high, data.low, data.close], options);
}

export function refFn(data, options) {
  return ADX.calculate({ period: options[0], high: data.high, low: data.low, close: data.close });
}

export function simdAssetsFn(stocks, options) {
  const inputs = stocks.map((s) => [s.high, s.low, s.close]);
  return ti.adx.simdByAssets(inputs, options);
}

export function simdOptionsFn(data, optionsList) {
  return ti.adx.simdByOptions([data.high, data.low, data.close], optionsList);
}
