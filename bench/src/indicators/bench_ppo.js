import * as ti from 'tulip-rs-node';
import { ppo } from 'indicatorts';

export const name = 'ppo';
// tulip ppo: [fast_period, slow_period] (no signal period)
export const optionsList = [[2, 5], [5, 35], [8, 21], [12, 26]];

export function tulipFn(data, options) {
  return ti.ppo.indicator([data.close], options);
}

export const refFn = null;

// indicatorts ppo: { fast, slow, signal } — signal defaults to 9
export function ref2Fn(data, options) {
  return ppo(data.close, { fast: options[0], slow: options[1] });
}
