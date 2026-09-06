import * as ti from "tulip-rs-node";

export const name = "adosc";
export const optionsList = [
  [3, 10],
  [6, 20],
  [12, 26],
  [20, 50],
];

export function tulipFn(data, options) {
  return ti.adosc.indicator(
    [data.high, data.low, data.close, data.volume],
    options,
  );
}

export const refFn = null;
export const ref2Fn = null;

export function simdAssetsFn(stocks, options) {
  const inputs = stocks.map((s) => [s.high, s.low, s.close, s.volume]);
  return ti.adosc.simdByAssets(inputs, options);
}

export function simdOptionsFn(data, optionsList) {
  return ti.adosc.simdByOptions([data.high, data.low, data.close, data.volume], optionsList);
}
