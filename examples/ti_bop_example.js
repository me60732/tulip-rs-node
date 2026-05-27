/**
 * Node.js example for the BOP indicator from tulip-rs-node.
 * BOP returns one output: BOP Line.
 */
import * as ti from "../index.js";

function main() {
  const open = [
    81.85, 81.2, 81.55, 82.91, 83.1, 83.41, 82.71, 82.7, 84.2, 84.25, 84.03,
    85.45, 86.18, 88.0, 87.6,
  ];
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
  const options = [];

  const info = ti.bop.info;
  console.log(`=== ${info.name.toUpperCase()} (${info.fullName}) ===`);
  console.log(`Type: ${info.indicatorType}`);
  console.log(`Inputs: ${info.inputs.join(", ")}`);
  console.log(
    `Options: ${info.options.length > 0 ? info.options.join(", ") : "none"} (current: ${JSON.stringify(options)})`,
  );
  console.log(`Outputs: ${info.outputs.join(", ")}`);
  console.log(`Minimum data required: ${ti.bop.minData(options)}`);
  console.log(
    `Minimum data for accuracy (6 decimals): ${ti.bop.minDataAccuracy(6)}`,
  );
  console.log();

  const [outputs] = ti.bop.indicator([open, high, low, close], options);
  console.log(`Full BOP Line: ${outputs[0]}`);

  const partialOpen = open.slice(0, -5);
  const partialHigh = high.slice(0, -5);
  const partialLow = low.slice(0, -5);
  const partialClose = close.slice(0, -5);
  const [outputs2, state2] = ti.bop.indicator(
    [partialOpen, partialHigh, partialLow, partialClose],
    options,
  );
  console.log(`\nPartial BOP Line: ${outputs2[0]}`);
  console.log("\nDemonstrating state continuation...");
  console.log("State info: BOP State - internal state for Balance of Power");
  const newOpen = open.slice(-5);
  const newHigh = high.slice(-5);
  const newLow = low.slice(-5);
  const newClose = close.slice(-5);
  const finalOutputs = state2.batchIndicator([
    newOpen,
    newHigh,
    newLow,
    newClose,
  ]);
  console.log(`Final BOP Line: ${finalOutputs[0]}`);
  console.log(
    `\nData split: ${partialOpen.length} + ${newOpen.length} = ${open.length} total elements`,
  );

  console.log("\n" + "=".repeat(60));
  console.log("SIMD BY ASSETS DEMONSTRATION");
  console.log("=".repeat(60));
  const simdInputs = [
    [[...open], [...high], [...low], [...close]],
    [
      open.map((v) => v * 1.2),
      high.map((v) => v * 1.2),
      low.map((v) => v * 1.2),
      close.map((v) => v * 1.2),
    ],
    [
      open.map((v, i) => 90 + i * 0.5 + v * 0.1),
      high.map((v, i) => 90 + i * 0.5 + v * 0.1),
      low.map((v, i) => 90 + i * 0.5 + v * 0.1),
      close.map((v, i) => 90 + i * 0.5 + v * 0.1),
    ],
    [
      open.map((v, i) => 100 - i * 0.3 + v * 0.05),
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
    const [simdOutputs] = ti.bop.simdByAssets(simdInputs, options);
    simdOutputs.forEach((output, i) =>
      console.log(`Asset ${i + 1} BOP values: ${output[0]}`),
    );
    console.log("\nVerification - calculating each asset individually:");
    simdInputs.forEach((inp, i) => {
      const [o] = ti.bop.indicator(inp, options);
      console.log(`Asset ${i + 1} individual: ${o[0]}`);
    });
    console.log("\nSIMD by Assets demonstration completed successfully!");
  } catch (e) {
    console.log(`SIMD by Assets error: ${e}`);
  }
}

main();
