import * as ti from 'tulip-rs-node';
import { OBV } from 'technicalindicators';

export const name = 'obv';
export const optionsList = [[]];

export function tulipFn(data, _options) {
  return ti.obv.indicator([data.close, data.volume], []);
}

export function refFn(data, _options) {
  return OBV.calculate({ close: data.close, volume: data.volume });
}
