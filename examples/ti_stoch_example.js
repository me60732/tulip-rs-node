import * as ti from "../index.js";

function main() {
  const close = Float64Array.from([
    81.59, 81.06, 82.87, 83.0, 83.61, 83.15, 82.84, 83.99, 84.55, 84.36, 85.53,
    86.54, 86.89, 87.77, 87.29,
  ]);
  const high = Float64Array.from([
    82.15, 81.89, 83.03, 83.3, 83.85, 83.9, 83.33, 84.3, 84.84, 85.0, 85.9,
    86.58, 86.98, 88.0, 87.87,
  ]);
  const low = Float64Array.from([
    81.29, 80.64, 81.31, 82.65, 83.07, 83.11, 82.49, 82.3, 84.15, 84.11, 84.03,
    85.39, 85.76, 87.17, 87.01,
  ]);
  const options = [5.0, 3.0, 3.0];

  const info = ti.stoch.info;
  console.log(`=== ${info.name.toUpperCase()} (${info.fullName}) ===`);
  console.log(`Type: ${info.indicatorType}`);
  console.log(`Inputs: ${info.inputs.join(", ")}`);
  console.log(
    `Options: ${info.options.join(", ")} (current: ${JSON.stringify(options)})`,
  );
  console.log(`Outputs: ${info.outputs.join(", ")}`);
  if (info.optionalOutputs && info.optionalOutputs.length > 0)
    console.log(`Optional Outputs: ${info.optionalOutputs.join(", ")}`);
  console.log(`Minimum data required: ${ti.stoch.minData(options)}`);
  console.log(
    `Minimum data for accuracy (6 decimals): ${ti.stoch.minDataAccuracy(options, 6)}`,
  );
  console.log();

  const [outputs] = ti.stoch.indicator([high, low, close], options);
  console.log(`Full %K Line: ${outputs[0]}`);
  console.log(`Full %D Line: ${outputs[1]}`);

  const partialHigh = high.slice(0, -1);
  const partialLow = low.slice(0, -1);
  const partialClose = close.slice(0, -1);
  const [outputs2, state2] = ti.stoch.indicator(
    [partialHigh, partialLow, partialClose],
    options,
  );
  console.log(`\nPartial %K Line: ${outputs2[0]}`);
  console.log(`Partial %D Line: ${outputs2[1]}`);
  console.log("\nDemonstrating state continuation...");
  console.log(
    "State info: STOCH State - internal state for Stochastic Oscillator",
  );
  const newHigh = high.slice(-1);
  const newLow = low.slice(-1);
  const newClose = close.slice(-1);
  const finalOutputs = state2.batchIndicator([newHigh, newLow, newClose]);
  console.log(`Final %K Line: ${finalOutputs[0]}`);
  console.log(`Final %D Line: ${finalOutputs[1]}`);
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
    const [simdOutputs] = ti.stoch.simdByAssets(simdInputs, options);
    simdOutputs.forEach((output, i) => {
      console.log(`Asset ${i + 1} %K values: ${output[0]}`);
      console.log(`Asset ${i + 1} %D values: ${output[1]}`);
    });
    console.log("\nVerification - calculating each asset individually:");
    simdInputs.forEach((inp, i) => {
      const [o] = ti.stoch.indicator(inp, options);
      console.log(`Asset ${i + 1} %K individual: ${o[0]}`);
      console.log(`Asset ${i + 1} %D individual: ${o[1]}`);
    });
    console.log("\nSIMD by Assets demonstration completed successfully!");
  } catch (e) {
    console.log(`SIMD by Assets error: ${e}`);
  }

  console.log("\n" + "=".repeat(60));
  console.log("SIMD BY OPTIONS NOTE");
  console.log("=".repeat(60));
  console.log("simdByOptions is not demonstrated for STOCH in this example.");
  console.log(
    "The multi-option SIMD path for stoch is not stable in the current native build.",
  );
}

main();
