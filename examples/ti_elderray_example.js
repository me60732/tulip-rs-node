/**
 * Node.js example for the ElderRay (Elder-ray) indicator from tulip-rs-node.
 * Elder-ray returns two primary outputs: Bull Power (high − EMA) and Bear Power (low − EMA).
 * Optional output: ema (the underlying EMA line).
 */
import * as ti from "../index.js";

function main() {
  const high = [
    82.15, 81.89, 83.03, 83.3, 83.85, 83.9, 83.33, 84.3, 84.84, 85.0, 85.9,
    86.58, 86.98, 88.0, 87.87,
  ];
  const low = [
    81.29, 80.64, 81.31, 82.65, 83.07, 83.11, 82.49, 82.3, 84.15, 84.11, 84.03,
    85.39, 85.76, 87.17, 87.01,
  ];
  const close = [
    81.59, 81.06, 82.87, 83.0, 83.61, 83.15, 82.84, 83.99, 84.55, 84.36, 85.53,
    86.54, 86.89, 87.77, 87.29,
  ];
  const options = [5.0]; // period = 5

  const info = ti.elderray.info;
  console.log(`=== ${info.name.toUpperCase()} (${info.fullName}) ===`);
  console.log(`Type: ${info.indicatorType}`);
  console.log(`Inputs: ${info.inputs.join(", ")}`);
  console.log(
    `Options: ${info.options.join(", ")} (current: ${JSON.stringify(options)})`,
  );
  console.log(`Outputs: ${info.outputs.join(", ")}`);
  if (info.optionalOutputs && info.optionalOutputs.length > 0)
    console.log(`Optional Outputs: ${info.optionalOutputs.join(", ")}`);
  console.log(`Minimum data required: ${ti.elderray.minData(options)}`);
  console.log(
    `Minimum data for accuracy (6 decimals): ${ti.elderray.minDataAccuracy(options, 6)}`,
  );
  console.log();

  // Full calculation — bull and bear power only
  const [outputs] = ti.elderray.indicator([high, low, close], options);
  console.log("Full dataset calculation:");
  console.log(`Bull Power (high - EMA): ${outputs[0]}`);
  console.log(`Bear Power (low  - EMA): ${outputs[1]}`);

  // Full calculation with optional EMA output
  const [outputsWithEma] = ti.elderray.indicator(
    [high, low, close],
    options,
    [true],
  );
  console.log("\nFull dataset (with optional EMA):");
  console.log(`Bull Power: ${outputsWithEma[0]}`);
  console.log(`Bear Power: ${outputsWithEma[1]}`);
  console.log(`EMA line:   ${outputsWithEma[2]}`);

  // Partial → state continuation
  const partialHigh = high.slice(0, -5);
  const partialLow = low.slice(0, -5);
  const partialClose = close.slice(0, -5);
  const [outputs2, state] = ti.elderray.indicator(
    [partialHigh, partialLow, partialClose],
    options,
  );
  console.log(`\nPartial Bull Power: ${outputs2[0]}`);
  console.log(`Partial Bear Power: ${outputs2[1]}`);

  const newHigh = high.slice(-5);
  const newLow = low.slice(-5);
  const newClose = close.slice(-5);
  console.log("\nDemonstrating state continuation...");
  const finalOutputs = state.batchIndicator([newHigh, newLow, newClose]);
  console.log(`Continued Bull Power: ${finalOutputs[0]}`);
  console.log(`Continued Bear Power: ${finalOutputs[1]}`);
  console.log(
    `\nData split: ${partialHigh.length} + ${newHigh.length} = ${high.length} total elements`,
  );

  // SIMD by assets
  console.log("\n" + "=".repeat(60));
  console.log("SIMD BY ASSETS DEMONSTRATION");
  console.log("=".repeat(60));
  const simdInputs = [
    [[...high], [...low], [...close]],
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
  try {
    const [simdOutputs] = ti.elderray.simdByAssets(simdInputs, options);
    simdOutputs.forEach((output, i) => {
      console.log(
        `Asset ${i + 1} Bull: ${output[0]}, Bear: ${output[1]}`,
      );
    });
    console.log("\nVerification - calculating each asset individually:");
    simdInputs.forEach((inp, i) => {
      const [o] = ti.elderray.indicator(inp, options);
      console.log(`Asset ${i + 1} Bull: ${o[0]}, Bear: ${o[1]}`);
    });
    console.log("\nSIMD by Assets demonstration completed successfully!");
  } catch (e) {
    console.log(`SIMD by Assets error: ${e}`);
  }

  // SIMD by options
  console.log("\n" + "=".repeat(60));
  console.log("SIMD BY OPTIONS DEMONSTRATION");
  console.log("=".repeat(60));
  // period=5  → min_data=6  → 10 output values
  // period=7  → min_data=8  →  8 output values
  // period=9  → min_data=10 →  6 output values
  // period=12 → min_data=13 →  3 output values
  const simdOptions = [[5.0], [7.0], [9.0], [12.0]];
  simdOptions.forEach((opt, i) =>
    console.log(`Option set ${i + 1}: period=${opt[0]}`),
  );
  console.log();
  try {
    const [simdOptOutputs] = ti.elderray.simdByOptions(
      [high, low, close],
      simdOptions,
    );
    simdOptOutputs.forEach((output, i) => {
      console.log(
        `Option set ${i + 1} (period=${simdOptions[i][0]}) Bull Power: ${output[0]}`,
      );
    });
    console.log("\nVerification - calculating each option set individually:");
    simdOptions.forEach((opt, i) => {
      const [o] = ti.elderray.indicator([high, low, close], opt);
      console.log(
        `Option set ${i + 1} (period=${opt[0]}) individual Bull Power: ${o[0]}`,
      );
    });
    console.log("\nSIMD by Options demonstration completed successfully!");
  } catch (e) {
    console.log(`SIMD by Options error: ${e}`);
  }
}

main();
