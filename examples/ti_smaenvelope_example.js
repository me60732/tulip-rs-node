/**
 * Node.js example for the SmaEnvelope indicator from tulip-rs-node.
 * SmaEnvelope returns three bands: lower, middle (SMA), and upper.
 * No optional outputs.
 *
 * lower  = SMA - SMA * (percentage / 100)
 * middle = SMA
 * upper  = SMA + SMA * (percentage / 100)
 */
import * as ti from "../index.js";

function main() {
  const close = [
    81.59, 81.06, 82.87, 83.0, 83.61, 83.15, 82.84, 83.99, 84.55, 84.36,
    85.53, 86.54, 86.89, 87.77, 87.29,
  ];
  const options = [5.0, 2.0]; // period=5, percentage=2.0%

  const info = ti.smaenvelope.info;
  console.log(`=== ${info.name.toUpperCase()} (${info.fullName}) ===`);
  console.log(`Type: ${info.indicatorType}`);
  console.log(`Inputs: ${info.inputs.join(", ")}`);
  console.log(
    `Options: ${info.options.join(", ")} (current: ${JSON.stringify(options)})`,
  );
  console.log(`Outputs: ${info.outputs.join(", ")}`);
  console.log(`Minimum data required: ${ti.smaenvelope.minData(options)}`);
  console.log(
    `Minimum data for accuracy (6 decimals): ${ti.smaenvelope.minDataAccuracy(options, 6)}`,
  );
  console.log();

  // Full calculation
  const [outputs] = ti.smaenvelope.indicator([close], options);
  console.log("Full dataset calculation:");
  console.log(`Lower:  ${outputs[0]}`);
  console.log(`Middle: ${outputs[1]}`);
  console.log(`Upper:  ${outputs[2]}`);

  // Partial → state continuation
  const partialClose = close.slice(0, -5);
  const [outputs2, state] = ti.smaenvelope.indicator([partialClose], options);
  console.log(`\nPartial Lower:  ${outputs2[0]}`);
  console.log(`Partial Middle: ${outputs2[1]}`);
  console.log(`Partial Upper:  ${outputs2[2]}`);

  const newClose = close.slice(-5);
  console.log("\nDemonstrating state continuation...");
  const finalOutputs = state.batchIndicator([newClose]);
  console.log(`Continued Lower:  ${finalOutputs[0]}`);
  console.log(`Continued Middle: ${finalOutputs[1]}`);
  console.log(`Continued Upper:  ${finalOutputs[2]}`);
  console.log(
    `\nData split: ${partialClose.length} + ${newClose.length} = ${close.length} total bars`,
  );

  // SIMD by assets — each asset has a single 'real' input series
  console.log("\n" + "=".repeat(60));
  console.log("SIMD BY ASSETS DEMONSTRATION");
  console.log("=".repeat(60));
  const simdInputs = [
    [[...close]],                                          // Asset 1: original
    [close.map((v) => v * 1.2)],                          // Asset 2: scaled up
    [close.map((v, i) => 90 + i * 0.5 + v * 0.1)],       // Asset 3: upward trend
    [close.map((v, i) => 100 - i * 0.3 + v * 0.05)],     // Asset 4: downward trend
  ];
  console.log(
    `Processing ${simdInputs.length} assets simultaneously using SIMD...`,
  );
  try {
    const [simdOutputs] = ti.smaenvelope.simdByAssets(simdInputs, options);
    simdOutputs.forEach((output, i) => {
      console.log(
        `Asset ${i + 1} Lower: ${output[0]}, Middle: ${output[1]}, Upper: ${output[2]}`,
      );
    });
    console.log("\nVerification - calculating each asset individually:");
    simdInputs.forEach((inp, i) => {
      const [o] = ti.smaenvelope.indicator(inp, options);
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
  //   period=10 → min_data=11 → 5 output values
  //   period=12 → min_data=13 → 3 output values
  const simdOptions = [
    [5.0, 2.0],   // period=5, 2% envelope
    [7.0, 3.0],   // period=7, 3% envelope
    [10.0, 2.0],  // period=10, 2% envelope
    [12.0, 5.0],  // period=12, 5% envelope
  ];
  simdOptions.forEach((opt, i) =>
    console.log(
      `Option set ${i + 1}: period=${opt[0]}, percentage=${opt[1]}%`,
    ),
  );
  console.log();
  try {
    const [simdOptOutputs] = ti.smaenvelope.simdByOptions([close], simdOptions);
    simdOptOutputs.forEach((output, i) => {
      console.log(
        `Option set ${i + 1} Middle (first 5): ${output[1].slice(0, 5)}`,
      );
    });
    console.log("\nVerification - calculating each option set individually:");
    simdOptions.forEach((opt, i) => {
      const [o] = ti.smaenvelope.indicator([close], opt);
      console.log(`Option set ${i + 1} Middle (first 5): ${o[1].slice(0, 5)}`);
    });
    console.log("\nSIMD by Options demonstration completed successfully!");
  } catch (e) {
    console.log(`SIMD by Options error: ${e}`);
  }
}

main();
