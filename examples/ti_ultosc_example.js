/**
 * Node.js example for the ULTOSC indicator from tulip-rs-node.
 * ULTOSC returns one output: Ultimate Oscillator Line.
 */
import * as ti from "../index.js";

function main() {
  const high = Float64Array.from([
    82.15, 81.89, 83.03, 83.3, 83.85, 83.9, 83.33, 84.3, 84.84, 85.0, 85.9,
    86.58, 86.98, 88.0, 87.87,
  ]);
  const low = Float64Array.from([
    81.29, 80.64, 81.31, 82.65, 83.07, 83.11, 82.49, 82.3, 84.15, 84.11, 84.03,
    85.39, 85.76, 87.17, 87.01,
  ]);
  const close = Float64Array.from([
    81.59, 81.06, 82.87, 83.0, 83.61, 83.15, 82.84, 83.99, 84.55, 84.36, 85.53,
    86.54, 86.89, 87.77, 87.29,
  ]);
  const options = [2.0, 5.0, 10.0]; // short period, medium period, long period

  const info = ti.ultosc.info;
  console.log(`=== ${info.name.toUpperCase()} (${info.fullName}) ===`);
  console.log(`Type: ${info.indicatorType}`);
  console.log(`Inputs: ${info.inputs.join(", ")}`);
  console.log(
    `Options: ${info.options.length > 0 ? info.options.join(", ") : "none"} (current: ${JSON.stringify(options)})`,
  );
  console.log(`Outputs: ${info.outputs.join(", ")}`);
  console.log(`Minimum data required: ${ti.ultosc.minData(options)}`);
  console.log(
  );
  console.log();

  const [outputs] = ti.ultosc.indicator([high, low, close], options);
  console.log(`Full Ultimate Oscillator Line: ${outputs[0]}`);

  const partialHigh = high.slice(0, -4);
  const partialLow = low.slice(0, -4);
  const partialClose = close.slice(0, -4);
  const [outputs2, state2] = ti.ultosc.indicator(
    [partialHigh, partialLow, partialClose],
    options,
  );
  console.log(`\nPartial Ultimate Oscillator Line: ${outputs2[0]}`);
  console.log("\nDemonstrating state continuation...");
  console.log(
    "State info: ULTOSC State - internal state for Ultimate Oscillator",
  );
  const newHigh = high.slice(-4);
  const newLow = low.slice(-4);
  const newClose = close.slice(-4);
  const finalOutputs = state2.batchIndicator([newHigh, newLow, newClose]);
  console.log(`Final Ultimate Oscillator Line: ${finalOutputs[0]}`);
  console.log(
    `\nData split: ${partialHigh.length} + ${newHigh.length} = ${high.length} total elements`,
  );

  console.log("\n" + "=".repeat(60));
  console.log("SIMD BY ASSETS DEMONSTRATION");
  console.log("=".repeat(60));
  const simdInputs = [
    [high.slice(), low.slice(), close.slice()],
    [
      high.map((v) => v * 1.2),
      low.map((v) => v * 1.2),
      close.map((v) => v * 1.2),
    ],
    [
      high.map((v, i) => 90 + i * 0.5 + v * 0.1),
      low.map((v, i) => 90 + i * 0.5 + v * 0.1),
      close.map((v, i) => 90 + i * 0.5 + v * 0.1),
    ],
    [
      high.map((v, i) => 100 - i * 0.3 + v * 0.05),
      low.map((v, i) => 100 - i * 0.3 + v * 0.05),
      close.map((v, i) => 100 - i * 0.3 + v * 0.05),
    ],
  ];
  console.log(
    `Processing ${simdInputs.length} assets simultaneously using SIMD...`,
  );
  console.log(
    "Asset 1: Original data\nAsset 2: Scaled up (+20% values)\nAsset 3: Different upward trend\nAsset 4: Downward trend\n",
  );
  try {
    const [simdOutputs] = ti.ultosc.simdByAssets(simdInputs, options);
    simdOutputs.forEach((output, i) =>
      console.log(`Asset ${i + 1} Ultimate Oscillator values: ${output[0]}`),
    );
    console.log("\nVerification - calculating each asset individually:");
    simdInputs.forEach((inp, i) => {
      const [o] = ti.ultosc.indicator(inp, options);
      console.log(`Asset ${i + 1} individual: ${o[0]}`);
    });
    console.log("\nSIMD by Assets demonstration completed successfully!");
  } catch (e) {
    console.log(`SIMD by Assets error: ${e}`);
  }

  console.log("\n" + "=".repeat(60));
  console.log("SIMD BY OPTIONS DEMONSTRATION");
  console.log("=".repeat(60));
  const expandedHigh = new Float64Array(Array.from({length:20}).flatMap(()=>Array.from(high)));
  const expandedLow = new Float64Array(Array.from({length:20}).flatMap(()=>Array.from(low)));
  const expandedClose = new Float64Array(Array.from({length:20}).flatMap(()=>Array.from(close)));
  const simdOptions = [
    [1, 3, 6],
    [2.0, 5.0, 10.0],
    [3, 7, 14],
    [4.0, 10.0, 20.0],
  ];
  simdOptions.forEach((opt, i) =>
    console.log(`Option set ${i + 1}: ${JSON.stringify(opt)}`),
  );
  console.log();
  try {
    const [simdOptOutputs] = ti.ultosc.simdByOptions(
      [expandedHigh, expandedLow, expandedClose],
      simdOptions,
    );
    simdOptOutputs.forEach((output, i) =>
      console.log(
        `Option set ${i + 1} Ultimate Oscillator values (first 5): ${output[0].slice(0, 5)}`,
      ),
    );
    console.log("\nVerification - calculating each option set individually:");
    simdOptions.forEach((opt, i) => {
      const [o] = ti.ultosc.indicator(
        [expandedHigh, expandedLow, expandedClose],
        opt,
      );
      console.log(
        `Option set ${i + 1} individual (first 5): ${o[0].slice(0, 5)}`,
      );
    });
    console.log("\nSIMD by Options demonstration completed successfully!");
  } catch (e) {
    console.log(`SIMD by Options error: ${e}`);
  }
}

main();
