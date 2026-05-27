"use strict";
const ti = require("../index");

function main() {
  const close = [
    81.59, 81.06, 82.87, 83.0, 83.61, 83.15, 82.84, 83.99, 84.55, 84.36, 85.53,
    86.54, 86.89, 87.77, 87.29,
  ];
  const high = [
    82.15, 81.89, 83.03, 83.3, 83.85, 83.9, 83.33, 84.3, 84.84, 85.0, 85.9,
    86.58, 86.98, 88.0, 87.87,
  ];
  const low = [
    81.29, 80.64, 81.31, 82.65, 83.07, 83.11, 82.49, 82.3, 84.15, 84.11, 84.03,
    85.39, 85.76, 87.17, 87.01,
  ];
  const options = [5.0];

  const info = ti.adxr.info;
  console.log(`=== ${info.name.toUpperCase()} (${info.fullName}) ===`);
  console.log(`Type: ${info.indicatorType}`);
  console.log(`Inputs: ${info.inputs.join(", ")}`);
  console.log(
    `Options: ${info.options.join(", ")} (current: ${JSON.stringify(options)})`,
  );
  console.log(`Outputs: ${info.outputs.join(", ")}`);
  if (info.optionalOutputs && info.optionalOutputs.length > 0)
    console.log(`Optional Outputs: ${info.optionalOutputs.join(", ")}`);
  console.log(`Minimum data required: ${ti.adxr.minData(options)}`);
  console.log(
    `Minimum data for accuracy (6 decimals): ${ti.adxr.minDataAccuracy(options, 6)}`,
  );
  console.log();

  const [outputs] = ti.adxr.indicator([high, low, close], options);
  console.log(`Full ADXR Line: ${outputs[0]}`);

  const minData = ti.adxr.minData(options);
  const splitAt = Math.min(5, high.length - minData);
  const partialHigh = high.slice(0, -splitAt);
  const partialLow = low.slice(0, -splitAt);
  const partialClose = close.slice(0, -splitAt);
  const [outputs2, state2] = ti.adxr.indicator(
    [partialHigh, partialLow, partialClose],
    options,
  );
  console.log(`\nPartial ADXR Line: ${outputs2[0]}`);
  console.log("\nDemonstrating state continuation...");
  console.log(
    "State info: ADXR State - internal state for Average Directional Movement Rating",
  );
  const newHigh = high.slice(-splitAt);
  const newLow = low.slice(-splitAt);
  const newClose = close.slice(-splitAt);
  const finalOutputs = state2.batchIndicator([newHigh, newLow, newClose]);
  console.log(`Final ADXR Line: ${finalOutputs[0]}`);
  console.log(
    `\nData split: ${partialHigh.length} + ${newHigh.length} = ${high.length} total elements`,
  );

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
  console.log(
    "Asset 1: Original data\nAsset 2: Scaled up (+20% values)\nAsset 3: Different upward trend\nAsset 4: Downward trend\n",
  );
  try {
    const [simdOutputs] = ti.adxr.simdByAssets(simdInputs, options);
    simdOutputs.forEach((output, i) =>
      console.log(`Asset ${i + 1} ADXR values: ${output[0]}`),
    );
    console.log("\nVerification - calculating each asset individually:");
    simdInputs.forEach((inp, i) => {
      const [o] = ti.adxr.indicator(inp, options);
      console.log(`Asset ${i + 1} individual: ${o[0]}`);
    });
    console.log("\nSIMD by Assets demonstration completed successfully!");
  } catch (e) {
    console.log(`SIMD by Assets error: ${e}`);
  }

  console.log("\n" + "=".repeat(60));
  console.log("SIMD BY OPTIONS DEMONSTRATION");
  console.log("=".repeat(60));
  const expandedHigh = Array(20).fill(high).flat();
  const expandedLow = Array(20).fill(low).flat();
  const expandedClose = Array(20).fill(close).flat();
  const simdOptions = [[2], [5.0], [8], [10.0]];
  simdOptions.forEach((opt, i) =>
    console.log(`Option set ${i + 1}: ${JSON.stringify(opt)}`),
  );
  console.log();
  try {
    const [simdOptOutputs] = ti.adxr.simdByOptions(
      [expandedHigh, expandedLow, expandedClose],
      simdOptions,
    );
    simdOptOutputs.forEach((output, i) =>
      console.log(
        `Option set ${i + 1} ADXR values (first 5): ${output[0].slice(0, 5)}`,
      ),
    );
    console.log("\nVerification - calculating each option set individually:");
    simdOptions.forEach((opt, i) => {
      const [o] = ti.adxr.indicator(
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
