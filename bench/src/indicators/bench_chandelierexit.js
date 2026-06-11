import * as ti from 'tulip-rs-node';
import { ce } from 'indicatorts';

export const name = 'chandelierexit';
// tulip: [period, atr_multiplier]; indicatorts ce: { period } only (hardcodes 3× ATR)
export const optionsList = [[14, 3], [22, 3], [20, 2], [50, 3]];

export function tulipFn(data, options) {
  return ti.chandelierexit.indicator([data.high, data.low, data.close], options);
}

export const refFn = null;

// Note: indicatorts ce ignores the multiplier (options[1]); always uses 3×.
export function ref2Fn(data, options) {
  return ce(data.high, data.low, data.close, { period: options[0] });
}
