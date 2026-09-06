import * as ti from 'tulip-rs-node';
import { StochasticRSI } from 'technicalindicators';

export const name = 'stochrsi';
export const optionsList = [[14], [20], [25], [30]];

export function tulipFn(data, options) {
  return ti.stochrsi.indicator([data.close], options);
}

export function refFn(data, options) {
  return StochasticRSI.calculate({
    rsiPeriod: options[0],
    stochasticPeriod: options[0],
    kPeriod: 3,
    dPeriod: 3,
    values: data.close,
  });
}

export function simdAssetsFn(stocks, options) {
  const inputs = stocks.map((s) => [s.close]);
  return ti.stochrsi.simdByAssets(inputs, options);
}

export function simdOptionsFn(data, optionsList) {
  return ti.stochrsi.simdByOptions([data.close], optionsList);
}
