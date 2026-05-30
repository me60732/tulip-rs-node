/**
 * Node.js example for the Mass Index indicator from tulip-rs-node.
 * Mass Index returns one output: Mass Index Line.
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
  const options = [5.0];

  const info = ti.mass.info;
  console.log(`=== ${info.name.toUpperCase()} (${info.fullName}) ===`);
  console.log(`Type: ${info.indicatorType}`);
  console.log(`Inputs: ${info.inputs.join(", ")}`);
  console.log(
    `Options: ${info.options.join(", ")} (current: ${JSON.stringify(options)})`,
  );
  console.log(`Outputs: ${info.outputs.join(", ")}`);
  if (info.optionalOutputs && info.optionalOutputs.length > 0) {
    console.log(`Optional Outputs: ${info.optionalOutputs.join(", ")}`);
  }
  console.log(`Minimum data required: ${ti.mass.minData(options)}`);
  console.log(
    `Minimum data for accuracy (6 decimals): ${ti.mass.minDataAccuracy(options, 6)}`,
  );
  console.log();

  // Double the data so we exceed min_data (21 bars for period=5)
  const fullHigh = [...high, ...high];
  const fullLow = [...low, ...low];

  const [outputs] = ti.mass.indicator([fullHigh, fullLow], options);
  console.log("Full dataset calculation:");
  console.log(`Full Mass Index Line: ${outputs[0]}`);

  const partialHigh = fullHigh.slice(0, -5);
  const partialLow = fullLow.slice(0, -5);
  const [outputs2, state2] = ti.mass.indicator(
    [partialHigh, partialLow],
    options,
  );
  console.log(`\nPartial calculation (first ${partialHigh.length} elements):`);
  console.log(`Partial Mass Index Line: ${outputs2[0]}`);

  console.log("\nDemonstrating state continuation...");
  console.log("State info: Mass State - internal state for Mass Index");
  const contHigh = fullHigh.slice(-5);
  const contLow = fullLow.slice(-5);
  const finalOutputs = state2.batchIndicator([contHigh, contLow]);
  console.log("Continued calculation:");
  console.log(`Final Mass Index Line: ${finalOutputs[0]}`);
  console.log(
    `\nData split: ${partialHigh.length} + ${contHigh.length} = ${fullHigh.length} total elements`,
  );

  console.log("\n" + "=".repeat(60));
  console.log("SIMD BY ASSETS DEMONSTRATION");
  console.log("=".repeat(60));
  const simdInputs = [
    [[...fullHigh], [...fullLow]],
    [fullHigh.map((v) => v * 1.2), fullLow.map((v) => v * 1.2)],
    [
      fullHigh.map((v, i) => 90 + i * 0.5 + v * 0.1),
      fullLow.map((v, i) => 90 + i * 0.5 + v * 0.1),
    ],
    [
      fullHigh.map((v, i) => 100 - i * 0.3 + v * 0.05),
      fullLow.map((v, i) => 100 - i * 0.3 + v * 0.05),
    ],
  ];
  console.log(
    `Processing ${simdInputs.length} assets simultaneously using SIMD...`,
  );
  console.log(
    "Asset 1: Original data\nAsset 2: Scaled up (+20% values)\nAsset 3: Different upward trend\nAsset 4: Downward trend\n",
  );
  try {
    const [simdOutputs] = ti.mass.simdByAssets(simdInputs, options);
    simdOutputs.forEach((output, i) =>
      console.log(`Asset ${i + 1} Mass Index Line: ${output[0]}`),
    );
    console.log("\nVerification - calculating each asset individually:");
    simdInputs.forEach((inp, i) => {
      const [o] = ti.mass.indicator(inp, options);
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
  const simdOptions = [[2], [5.0], [8], [10.0]];
  simdOptions.forEach((opt, i) =>
    console.log(`Option set ${i + 1}: ${JSON.stringify(opt)}`),
  );
  console.log();
  try {
    const [simdOptOutputs] = ti.mass.simdByOptions(
      [expandedHigh, expandedLow],
      simdOptions,
    );
    simdOptOutputs.forEach((output, i) =>
      console.log(
        `Option set ${i + 1} Mass Index Line (first 5): ${output[0].slice(0, 5)}`,
      ),
    );
    console.log("\nVerification - calculating each option set individually:");
    simdOptions.forEach((opt, i) => {
      const [o] = ti.mass.indicator([expandedHigh, expandedLow], opt);
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
