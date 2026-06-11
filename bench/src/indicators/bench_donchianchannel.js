import * as ti from 'tulip-rs-node';
import { dc } from 'indicatorts';

export const name = 'donchianchannel';
export const optionsList = [[14], [20], [50], [100]];

export function tulipFn(data, options) {
  return ti.donchianchannel.indicator([data.high, data.low], options);
}

export const refFn = null;

// Note: tulip donchianchannel uses [high, low]; indicatorts dc uses closings only.
// Results will differ but throughput is comparable.
export function ref2Fn(data, options) {
  return dc(data.close, { period: options[0] });
}
