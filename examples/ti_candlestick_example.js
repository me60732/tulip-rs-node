/**
 * Node.js example for the Candlestick indicator from tulip-rs-node.
 *
 * The candlestick indicator returns pattern objects per bar instead of numeric
 * values. Each bar result is null (no pattern) or an array of:
 *   { name, fullName, japaneseName, bars, forecast }
 *
 * The optional third argument to indicator() and batchIndicator() is a
 * ForecastType filter string. Valid values:
 *   'BullishReversal' | 'BearishReversal'
 *   'BullishContinuation' | 'BearishContinuation'
 *   'BullishReversalOrContinuation' | 'BearishReversalOrContinuation'
 *   undefined — no filter, return all trend-matching patterns
 *
 * This example demonstrates:
 * 1. Basic pattern detection — no ForecastType filter
 * 2. ForecastType filtering — BullishReversal only
 * 3. ForecastType filtering — BearishReversal only
 * 4. Streaming continuation with a ForecastType filter
 */
import * as ti from "../index.js";

function printBars(result) {
  result.forEach((entry, i) => {
    if (entry && entry.length > 0) {
      const names = entry.map((p) => p.name).join(", ");
      console.log(`  bar ${String(i).padStart(2)}: ${names}`);
    }
  });
}

function printDetail(patterns) {
  if (!patterns || patterns.length === 0) {
    console.log("  (none)");
    return;
  }
  patterns.forEach((p) => {
    console.log(
      `  - ${p.fullName} (${p.japaneseName})  bars: ${p.bars}  forecast: ${p.forecast}`,
    );
  });
}

function main() {
  const open = [
    81.85, 81.2, 81.55, 82.91, 83.1, 83.41, 82.71, 82.7, 84.2, 84.25, 84.03,
    85.45, 86.18, 88.0, 87.3, 87.3, 86.4, 84.3, 85.6,
  ];
  const high = [
    82.15, 81.89, 83.03, 83.3, 83.85, 83.9, 83.33, 84.3, 84.84, 85.0, 85.9,
    86.58, 86.98, 88.0, 87.31, 87.3, 86.4, 85.5, 85.65,
  ];
  const low = [
    81.29, 80.64, 81.31, 82.65, 83.07, 83.11, 82.49, 82.3, 84.15, 84.11, 84.03,
    85.39, 85.76, 87.17, 87.2, 86.3, 85.3, 84.0, 83.85,
  ];
  const close = [
    81.59, 81.06, 82.87, 83.0, 83.61, 83.15, 82.84, 83.99, 84.55, 84.36, 85.53,
    86.54, 86.89, 87.77, 87.29, 86.3, 85.3, 84.0, 83.9,
  ];
  const options = [5.0, 1.0, 1.0]; // candle_period, trend_period, trend_signal_period

  console.log(
    `Bars: ${close.length}  |  min_data: ${ti.candlestick.minData(options)}`,
  );

  // ── Run 1: All patterns (no filter) ────────────────────────────────────────
  console.log("\n" + "=".repeat(60));
  console.log("Run 1: All patterns (no ForecastType filter)");
  console.log("=".repeat(60));

  const [result, state] = ti.candlestick.indicator(
    [open, high, low, close],
    options,
  );
  console.log(`\n${result.length} output bars:`);
  printBars(result);
  console.log("\nLast bar detail:");
  printDetail(result[result.length - 1]);

  // ── Run 2: BullishReversal filter ──────────────────────────────────────────
  console.log("\n" + "=".repeat(60));
  console.log("Run 2: ForecastType filter = 'BullishReversal'");
  console.log("=".repeat(60));

  const [bullish] = ti.candlestick.indicator(
    [open, high, low, close],
    options,
    "BullishReversal",
  );
  console.log(`\n${bullish.length} output bars:`);
  printBars(bullish);
  console.log("\nLast bar detail:");
  printDetail(bullish[bullish.length - 1]);

  // ── Run 3: BearishReversal filter ──────────────────────────────────────────
  console.log("\n" + "=".repeat(60));
  console.log("Run 3: ForecastType filter = 'BearishReversal'");
  console.log("=".repeat(60));

  const [bearish] = ti.candlestick.indicator(
    [open, high, low, close],
    options,
    "BearishReversal",
  );
  console.log(`\n${bearish.length} output bars:`);
  printBars(bearish);
  console.log("\nLast bar detail:");
  printDetail(bearish[bearish.length - 1]);

  // ── Streaming: new bar with ForecastType filter ────────────────────────────
  console.log("\n" + "=".repeat(60));
  console.log("Streaming: new bar via Run 1 state, filter = 'BullishReversal'");
  console.log("=".repeat(60));

  const newResult = state.batchIndicator(
    [[84.0], [84.5], [83.2], [83.5]],
    "BullishReversal",
  );
  console.log("\nNew bar patterns:");
  printDetail(newResult[0]);
}

main();
