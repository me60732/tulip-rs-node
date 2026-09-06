import * as ti from 'tulip-rs-node';
import { IchimokuCloud } from 'technicalindicators';

export const name = 'ichimoku';
export const optionsList = [[9, 26], [5, 10], [7, 14], [9, 52]];

export function tulipFn(data, options) {
  return ti.ichimoku.indicator([data.high, data.low, data.close], options);
}

export function refFn(data, options) {
  return IchimokuCloud.calculate({
    high: Array.from(data.high),
    low: Array.from(data.low),
    conversionPeriod: options[0],
    basePeriod: options[1],
    simpleCloudConversion: false,
    displacement: options[1],
  });
}

export const ref2Fn = null;

export function simdAssetsFn(stocks, options) {
  const inputs = stocks.map((s) => [s.high, s.low, s.close]);
  return ti.ichimoku.simdByAssets(inputs, options);
}

export function simdOptionsFn(data, optionsList) {
  return ti.ichimoku.simdByOptions([data.high, data.low, data.close], optionsList);
}
