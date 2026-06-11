import * as ti from 'tulip-rs-node';
import { tema } from 'indicatorts';

export const name = 'tema';
export const optionsList = [[5], [14], [50], [200]];

export function tulipFn(data, options) {
  return ti.tema.indicator([data.close], options);
}

export const refFn = null;

export function ref2Fn(data, options) {
  return tema(data.close, { period: options[0] });
}
