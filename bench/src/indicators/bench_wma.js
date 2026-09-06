import * as ti from 'tulip-rs-node';
import { WMA } from 'technicalindicators';

export const name = 'wma';
export const optionsList = [[50], [100], [200], [300]];

export function tulipFn(data, options) {
  return ti.wma.indicator([data.close], options);
}

export function refFn(data, options) {
  return WMA.calculate({ period: options[0], values: data.close });
}

export function simdAssetsFn(stocks, options) {
  const inputs = stocks.map((s) => [s.close]);
  return ti.wma.simdByAssets(inputs, options);
}

export function simdOptionsFn(data, optionsList) {
  return ti.wma.simdByOptions([data.close], optionsList);
}
