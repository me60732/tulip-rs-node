import * as ti from 'tulip-rs-node';
import { Stochastic } from 'technicalindicators';

export const name = 'stoch';
export const optionsList = [[14, 3, 3], [5, 3, 3], [9, 3, 3], [20, 5, 5]];

export function tulipFn(data, options) {
  return ti.stoch.indicator([data.high, data.low, data.close], options);
}

export function refFn(data, options) {
  return Stochastic.calculate({
    period: options[0],
    signalPeriod: options[2],
    high: data.high,
    low: data.low,
    close: data.close,
  });
}
