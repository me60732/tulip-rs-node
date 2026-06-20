/**
 * Node.js example for the DonchianChannel indicator from tulip-rs-node.
 * DonchianChannel returns three bands: lower, middle, and upper.
 * No optional outputs.
 *
 * lower  = lowest low over 'period' bars
 * middle = (upper + lower) / 2
 * upper  = highest high over 'period' bars
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
  const options = [5.0]; // period=5

  const info = ti.donchianchannel.info;
  console.log(`=== ${info.name.toUpperCase()} (${info.fullName}) ===`);
  console.log(`Type: ${info.indicatorType}`);
  console.log(`Inputs: ${info.inputs.join(", ")}`);
  console.log(
    `Options: ${info.options.join(", ")} (current: ${JSON.stringify(options)})`,
  );
  console.log(`Outputs: ${info.outputs.join(", ")}`);
  console.log(`Minimum data required: ${ti.donchianchannel.minData(options)}`);
  console.log(
  );
  console.log();

  // Full calculation
  const [outputs] = ti.donchianchannel.indicator([high, low], options);
  console.log("Full dataset calculation:");
  console.log(`Lower  (lowest low):    ${outputs[0]}`);
  console.log(`Middle ((upper+lower)/2): ${outputs[1]}`);
  console.log(`Upper  (highest high):  ${outputs[2]}`);

  // Partial → state continuation
  const partialHigh = high.slice(0, -5);
  const partialLow = low.slice(0, -5);
  const [outputs2, state] = ti.donchianchannel.indicator(
    [partialHigh, partialLow],
    options,
  );
  console.log(`\nPartial Lower:  ${outputs2[0]}`);
  console.log(`Partial Middle: ${outputs2[1]}`);
  console.log(`Partial Upper:  ${outputs2[2]}`);

  const newHigh = high.slice(-5);
  const newLow = low.slice(-5);
  console.log("\nDemonstrating state continuation...");
  const finalOutputs = state.batchIndicator([newHigh, newLow]);
  console.log(`Continued Lower:  ${finalOutputs[0]}`);
  console.log(`Continued Middle: ${finalOutputs[1]}`);
  console.log(`Continued Upper:  ${finalOutputs[2]}`);
  console.log(
    `\nData split: ${partialHigh.length} + ${newHigh.length} = ${high.length} total bars`,
  );

  // SIMD by assets — each asset has two input series: [high, low]
  console.log("\n" + "=".repeat(60));
  console.log("SIMD BY ASSETS DEMONSTRATION");
  console.log("=".repeat(60));
  const simdInputs = [
    [high.slice(), low.slice()],
    [high.map((v) => v * 1.2), low.map((v) => v * 1.2)],
    [
      high.map((v, i) => 90 + i * 0.5 + v * 0.1),
      low.map((v, i) => 90 + i * 0.5 + v * 0.1),
    ],
    [
      high.map((v, i) => 100 - i * 0.3 + v * 0.05),
      low.map((v, i) => 100 - i * 0.3 + v * 0.05),
    ],
  ];
  console.log(
    `Processing ${simdInputs.length} assets simultaneously using SIMD...`,
  );
  try {
    const [simdOutputs] = ti.donchianchannel.simdByAssets(simdInputs, options);
    simdOutputs.forEach((output, i) => {
      console.log(
        `Asset ${i + 1} Lower: ${output[0]}, Middle: ${output[1]}, Upper: ${output[2]}`,
      );
    });
    console.log("\nVerification - calculating each asset individually:");
    simdInputs.forEach((inp, i) => {
      const [o] = ti.donchianchannel.indicator(inp, options);
      console.log(
        `Asset ${i + 1} Lower: ${o[0]}, Middle: ${o[1]}, Upper: ${o[2]}`,
      );
    });
    console.log("\nSIMD by Assets demonstration completed successfully!");
  } catch (e) {
    console.log(`SIMD by Assets error: ${e}`);
  }

  // SIMD by options
  console.log("\n" + "=".repeat(60));
  console.log("SIMD BY OPTIONS DEMONSTRATION");
  console.log("=".repeat(60));
  // Option sets chosen to produce meaningful output with 15 bars:
  //   period=5  → min_data=6  → 10 output values
  //   period=7  → min_data=8  → 8 output values
  //   period=9  → min_data=10 → 6 output values
  //   period=12 → min_data=13 → 3 output values
  const simdOptions = [
    [5.0],   // period=5
    [7.0],   // period=7
    [9.0],   // period=9
    [12.0],  // period=12
  ];
  simdOptions.forEach((opt, i) =>
    console.log(`Option set ${i + 1}: period=${opt[0]}`),
  );
  console.log();
  try {
    const [simdOptOutputs] = ti.donchianchannel.simdByOptions(
      [high, low],
      simdOptions,
    );
    simdOptOutputs.forEach((output, i) => {
      console.log(
        `Option set ${i + 1} Upper (first 5): ${output[2].slice(0, 5)}`,
      );
    });
    console.log("\nVerification - calculating each option set individually:");
    simdOptions.forEach((opt, i) => {
      const [o] = ti.donchianchannel.indicator([high, low], opt);
      console.log(`Option set ${i + 1} Upper (first 5): ${o[2].slice(0, 5)}`);
    });
    console.log("\nSIMD by Options demonstration completed successfully!");
  } catch (e) {
    console.log(`SIMD by Options error: ${e}`);
  }
}

main();
