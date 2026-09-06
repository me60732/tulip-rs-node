import * as ti from 'tulip-rs-node';
import { emv } from 'indicatorts';

export const name = 'emv';
// tulip emv has no options; indicatorts emv defaults to period=14
export const optionsList = [[]];

export function tulipFn(data, _options) {
  return ti.emv.indicator([data.high, data.low, data.volume], []);
}

export const refFn = null;

export function ref2Fn(data, _options) {
  return emv(data.high, data.low, data.volume);
}

export function simdAssetsFn(stocks, _options) {
  const inputs = stocks.map((s) => [s.high, s.low, s.volume]);
  return ti.emv.simdByAssets(inputs, []);
}
