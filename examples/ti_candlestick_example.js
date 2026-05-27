'use strict';
/**
 * Node.js example for the Candlestick indicator from tulip-rs-node.
 *
 * The candlestick indicator returns pattern objects per bar instead of numeric values.
 * Each bar result is an array of pattern objects:
 *   { name, fullName, japaneseName, bars, forecast }
 *
 * This example demonstrates:
 * 1. Basic candlestick pattern detection
 * 2. State continuation with new bar data
 */
const ti = require('../index');

function main() {
  // Exact data from the Rust example (19 bars including pattern bars)
  const open  = [81.85, 81.20, 81.55, 82.91, 83.10, 83.41, 82.71, 82.70, 84.20, 84.25, 84.03, 85.45, 86.18, 88.00, 87.30, 87.30, 86.40, 84.30, 85.60];
  const high  = [82.15, 81.89, 83.03, 83.30, 83.85, 83.90, 83.33, 84.30, 84.84, 85.00, 85.90, 86.58, 86.98, 88.00, 87.31, 87.30, 86.40, 85.50, 85.65];
  const low   = [81.29, 80.64, 81.31, 82.65, 83.07, 83.11, 82.49, 82.30, 84.15, 84.11, 84.03, 85.39, 85.76, 87.17, 87.20, 86.30, 85.30, 84.00, 83.85];
  const close = [81.59, 81.06, 82.87, 83.00, 83.61, 83.15, 82.84, 83.99, 84.55, 84.36, 85.53, 86.54, 86.89, 87.77, 87.29, 86.30, 85.30, 84.00, 83.90];
  const options = [5.0, 1.0, 1.0]; // candle_period, trend_period, trend_signal_period

  const minBars = ti.candlestick.minData(options);
  const nBars = close.length;
  console.log(`Bars in: ${nBars}  |  min_data: ${minBars}`);

  // ── Run 1: All trend-matching patterns ──────────────────────────────
  console.log('\n' + '='.repeat(60));
  console.log('Run 1: All trend-matching patterns');
  console.log('='.repeat(60));

  const [result, state] = ti.candlestick.indicator([open, high, low, close], options);

  console.log(`\nFull result (${result.length} output bars):`);
  result.forEach((entry, i) => {
    if (entry && entry.length > 0) {
      const names = entry.map(p => p.name);
      console.log(`  bar ${String(i).padStart(2)}: ${names.join(', ')}`);
    }
  });

  const last = result[result.length - 1];
  if (last && last.length > 0) {
    console.log('\nPatterns found on last bar:');
    last.forEach(p => {
      console.log(`  - ${p.fullName} (${p.japaneseName}),  bars: ${p.bars},  forecast: ${p.forecast}`);
    });
  } else {
    console.log('\nNo patterns on last bar.');
  }

  // ── Streaming continuation from Run 1 state ──────────────────────────
  console.log('\n' + '='.repeat(60));
  console.log('Streaming: one new bar appended to Run 1 state');
  console.log('='.repeat(60));

  const newOpen  = [84.00];
  const newHigh  = [84.50];
  const newLow   = [83.20];
  const newClose = [83.50];

  const newResult = state.batchIndicator([newOpen, newHigh, newLow, newClose]);
  const entry = newResult[0];
  if (entry && entry.length > 0) {
    console.log('Patterns on new bar:');
    entry.forEach(p => {
      console.log(`  - ${p.fullName} (${p.japaneseName}),  bars: ${p.bars},  forecast: ${p.forecast}`);
    });
  } else {
    console.log('No patterns on new bar.');
  }
}

main();
