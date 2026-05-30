/**
 * Node.js example for the TRIX indicator from tulip-rs-node.
 * TRIX returns one output: TRIX Line.
 */
import * as ti from "../index.js";

function main() {
  const close = [
    81.59, 81.06, 82.87, 83.0, 83.61, 83.15, 82.84, 83.99, 84.55, 84.36, 85.53,
    86.54, 86.89, 87.77, 87.29,
  ];
  const options = [5.0];

  const info = ti.trix.info;
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
  console.log(`Minimum data required: ${ti.trix.minData(options)}`);
  console.log(
    `Minimum data for accuracy (6 decimals): ${ti.trix.minDataAccuracy(options, 6)}`,
  );
  console.log();

  const [outputs] = ti.trix.indicator([close], options);
  console.log(`Full TRIX Line: ${outputs[0]}`);

  const partialClose = close.slice(0, -1);
  const [outputs2, state2] = ti.trix.indicator([partialClose], options);
  console.log(`\nPartial TRIX Line: ${outputs2[0]}`);
  console.log("\nDemonstrating state continuation...");
  console.log("State info: TRIX State - internal state for Trix");
  const newClose = close.slice(-1);
  const finalOutputs = state2.batchIndicator([newClose]);
  console.log(`Final TRIX Line: ${finalOutputs[0]}`);
  console.log(
    `\nData split: ${partialClose.length} + ${newClose.length} = ${close.length} total elements`,
  );

  console.log("\n" + "=".repeat(60));
  console.log("SIMD BY ASSETS DEMONSTRATION");
  console.log("=".repeat(60));
  const simdInputs = [
    [[...close]],
    [close.map((v) => v * 1.2)],
    [close.map((v, i) => 90 + i * 0.5 + v * 0.1)],
    [close.map((v, i) => 100 - i * 0.3 + v * 0.05)],
  ];
  console.log(
    `Processing ${simdInputs.length} assets simultaneously using SIMD...`,
  );
  console.log(
    "Asset 1: Original data\nAsset 2: Scaled up (+20% values)\nAsset 3: Different upward trend\nAsset 4: Downward trend\n",
  );
  try {
    const [simdOutputs] = ti.trix.simdByAssets(simdInputs, options);
    simdOutputs.forEach((output, i) =>
      console.log(`Asset ${i + 1} TRIX values: ${output[0]}`),
    );
    console.log("\nVerification - calculating each asset individually:");
    simdInputs.forEach((inp, i) => {
      const [o] = ti.trix.indicator(inp, options);
      console.log(`Asset ${i + 1} individual: ${o[0]}`);
    });
    console.log("\nSIMD by Assets demonstration completed successfully!");
  } catch (e) {
    console.log(`SIMD by Assets error: ${e}`);
  }

  console.log("\n" + "=".repeat(60));
  console.log("SIMD BY OPTIONS DEMONSTRATION");
  console.log("=".repeat(60));
  const expandedClose = Array(20).fill(close).flat();
  const simdOptions = [[2], [5.0], [8], [10.0]];
  simdOptions.forEach((opt, i) =>
    console.log(`Option set ${i + 1}: ${JSON.stringify(opt)}`),
  );
  console.log();
  try {
    const [simdOptOutputs] = ti.trix.simdByOptions(
      [expandedClose],
      simdOptions,
    );
    simdOptOutputs.forEach((output, i) =>
      console.log(
        `Option set ${i + 1} TRIX values (first 5): ${output[0].slice(0, 5)}`,
      ),
    );
    console.log("\nVerification - calculating each option set individually:");
    simdOptions.forEach((opt, i) => {
      const [o] = ti.trix.indicator([expandedClose], opt);
      console.log(
        `Option set ${i + 1} individual (first 5): ${o[0].slice(0, 5)}`,
      );
    });
    console.log("\nSIMD by Options demonstration completed successfully!");
  } catch (e) {
    console.log(`SIMD by Options error: ${e}`);
  }

  // ── Optional Outputs ─────────────────────────────────────────────────────
  console.log("\n" + "=".repeat(60));
  console.log("OPTIONAL OUTPUTS");
  console.log("=".repeat(60));
  // Available: 'tema', 'dema', 'ema'
  const _nBase = ti.trix.info.outputs.length;
  const _optNames = ti.trix.info.optionalOutputs;
  console.log(`Optional outputs: ${_optNames.join(", ")}`);
  console.log();

  // Enable all optional outputs
  const [_allOut] = ti.trix.indicator(
    [close],
    options,
    _optNames.map(() => true),
  );
  console.log("All optional outputs enabled:");
  _optNames.forEach((n, i) => {
    console.log(`  ${n}: ${_allOut[_nBase + i]}`);
  });

  // Enable only the first optional output
  const [_firstOut] = ti.trix.indicator(
    [close],
    options,
    _optNames.map((_, i) => i === 0),
  );
  console.log(`\nOnly '${_optNames[0]}' enabled:`);
  console.log(`  ${_optNames[0]}: ${_firstOut[_nBase]}`);
  console.log(`  dema: [] (not requested)`);
}

main();
