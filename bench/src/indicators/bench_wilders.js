import * as ti from 'tulip-rs-node';
import { WEMA } from 'technicalindicators';

export const name = 'wilders';
export const optionsList = [[14], [20], [50], [100]];

export function tulipFn(data, options) {
  return ti.wilders.indicator([data.close], options);
}

export function refFn(data, options) {
  return WEMA.calculate({ period: options[0], values: data.close });
}
