/**
 * Node.js example for the RoofingFilter indicator from tulip-rs-node.
 * The Roofing Filter combines a high-pass filter with a super smoother to remove
 * aliasing noise and low-frequency trends. Optional output: highpass.
 */
import * as ti from "../index.js";

function main() {
  const close = Float64Array.from([
    81.59, 81.06, 82.87, 83.0, 83.61, 83.15, 82.84, 83.99, 84.55, 84.36, 85.53,
    86.54, 86.89, 87.77, 87.29, 87.5, 88.1, 88.5, 87.9, 88.2, 88.8, 89.1, 88.7,
    89.3, 89.7, 90.1, 89.5, 90.2, 90.8, 91.1, 90.5, 91.2, 91.8, 92.1, 91.5,
    92.2, 92.8, 93.1, 92.5, 93.2,
  ]);
  const options = [10.0, 20.0];

  const info = ti.roofingfilter.info;
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
  console.log(`Minimum data required: ${ti.roofingfilter.minData(options)}`);
  console.log();

  const [outputs] = ti.roofingfilter.indicator([close], options);
  console.log(`Full RoofingFilter Value: ${outputs[0]}`);

  const n = close.length - 5;
  const [outputs2, state2] = ti.roofingfilter.indicator(
    [close.slice(0, n)],
    options,
  );
  console.log(`\nPartial RoofingFilter Value: ${outputs2[0]}`);

  console.log("\nDemonstrating state continuation...");
  console.log(
    "State info: RoofingFilter State - internal state for Roofing Filter",
  );
  const finalOutputs = state2.batchIndicator([close.slice(n)]);
  console.log(`Final RoofingFilter Value: ${finalOutputs[0]}`);
  console.log(
    `\nData split: ${n} + ${close.length - n} = ${close.length} total elements`,
  );

  console.log("\n" + "=".repeat(60));
  console.log("SIMD BY ASSETS DEMONSTRATION");
  console.log("=".repeat(60));
  const simdInputs = [
    [close.slice()],
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
    const [simdOutputs] = ti.roofingfilter.simdByAssets(simdInputs, options);
    simdOutputs.forEach((output, i) =>
      console.log(`Asset ${i + 1} RoofingFilter Value: ${output[0]}`),
    );
    console.log("\nVerification - calculating each asset individually:");
    simdInputs.forEach((inp, i) => {
      const [o] = ti.roofingfilter.indicator(inp, options);
      console.log(`Asset ${i + 1} individual: ${o[0]}`);
    });
    console.log("\nSIMD by Assets demonstration completed successfully!");
  } catch (e) {
    console.log(`SIMD by Assets error: ${e}`);
  }

  console.log("\n" + "=".repeat(60));
  console.log("SIMD BY OPTIONS DEMONSTRATION");
  console.log("=".repeat(60));
  // Option sets chosen so every minData <= close.length (40): formula is hp_period + 1
  const simdOptions = [
    [5, 10],
    [10, 20],
    [15, 30],
    [19, 38],
  ];
  simdOptions.forEach((opt, i) =>
    console.log(`Option set ${i + 1}: ${JSON.stringify(opt)}`),
  );
  console.log();
  try {
    const [simdOptOutputs] = ti.roofingfilter.simdByOptions(
      [close],
      simdOptions,
    );
    simdOptOutputs.forEach((output, i) =>
      console.log(
        `Option set ${i + 1} RoofingFilter (first 5): ${output[0].slice(0, 5)}`,
      ),
    );
    console.log("\nVerification - calculating each option set individually:");
    simdOptions.forEach((opt, i) => {
      const [o] = ti.roofingfilter.indicator([close], opt);
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
  const _nBase = ti.roofingfilter.info.outputs.length;
  const _optNames = ti.roofingfilter.info.optionalOutputs;
  console.log(`Optional outputs: ${_optNames.join(", ")}`);
  console.log();

  const [_allOut] = ti.roofingfilter.indicator(
    [close],
    options,
    _optNames.map(() => true),
  );
  console.log("All optional outputs enabled:");
  _optNames.forEach((n, i) => {
    console.log(`  ${n}: ${_allOut[_nBase + i]}`);
  });

  const [_firstOut] = ti.roofingfilter.indicator(
    [close],
    options,
    _optNames.map((_, i) => i === 0),
  );
  console.log(`\nOnly '${_optNames[0]}' enabled:`);
  console.log(`  ${_optNames[0]}: ${_firstOut[_nBase]}`);
}

main();
