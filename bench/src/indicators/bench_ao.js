import * as ti from 'tulip-rs-node';
import { AwesomeOscillator } from 'technicalindicators';

export const name = 'ao';
export const optionsList = [[]];

export function tulipFn(data, _options) {
  return ti.ao.indicator([data.high, data.low], []);
}

export function refFn(data, _options) {
  return AwesomeOscillator.calculate({ fastPeriod: 5, slowPeriod: 34, high: data.high, low: data.low });
}
