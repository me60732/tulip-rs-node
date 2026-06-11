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
