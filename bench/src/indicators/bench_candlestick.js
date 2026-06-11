import * as ti from 'tulip-rs-node';
import { bullish, bearish } from 'technicalindicators';

export const name = 'Rust_Candlestick';
// options: [candle_period, trend_period, trend_signal]
export const optionsList = [[5, 1, 1], [10, 1, 1], [20, 1, 1]];

export function tulipFn(data, options) {
  // Single native call scans all bars in one pass
  return ti.candlestick.indicator([data.open, data.high, data.low, data.close], options);
}

// technicalindicators has no bulk candlestick scan, so we replicate the approach
// with a sliding window. tulip_rs_node does this in a single native call; here
// we must iterate bar-by-bar in JS to produce a comparable output length.
export function refFn(data, _options) {
  const { open, high, low, close } = data;
  const n = close.length;
  const W = 5; // fixed window — covers the max bars any supported pattern needs
  const results = [];
  for (let i = W; i <= n; i++) {
    const win = {
      open:  open.slice(i - W, i),
      high:  high.slice(i - W, i),
      low:   low.slice(i - W, i),
      close: close.slice(i - W, i),
    };
    results.push(bullish(win) || bearish(win));
  }
  return results;
}
