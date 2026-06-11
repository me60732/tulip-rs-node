import * as ti from 'tulip-rs-node';
import { kc } from 'indicatorts';

export const name = 'keltnerchannel';
// tulip: [period, atr_multiplier_step]; indicatorts kc: { period } only (hardcodes 2× ATR)
export const optionsList = [[14, 2], [20, 2], [20, 1.5], [50, 2]];

export function tulipFn(data, options) {
  return ti.keltnerchannel.indicator([data.high, data.low, data.close], options);
}

export const refFn = null;

// Note: indicatorts kc ignores the ATR multiplier (options[1]); always uses 2×.
export function ref2Fn(data, options) {
  return kc(data.high, data.low, data.close, { period: options[0] });
}
