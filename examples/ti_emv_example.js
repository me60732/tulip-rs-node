/**
 * Node.js example for the EMV indicator from tulip-rs-node.
 * Ease of Movement uses High, Low, Volume inputs with no options.
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
  const volume = Float64Array.from([
    5653100, 6447400, 7690900, 3831400, 4455100, 3798000, 3936200, 4732000,
    4841300, 3915300, 6830800, 6694100, 5293600, 7985800, 4807900,
  ]);
  const options = [];

  const info = ti.emv.info;
  console.log(`=== ${info.name.toUpperCase()} (${info.fullName}) ===`);
  console.log(`Type: ${info.indicatorType}`);
  console.log(`Inputs: ${info.inputs.join(", ")}`);
  console.log(
    `Options: ${info.options.length > 0 ? info.options.join(", ") : "none"} (current: ${JSON.stringify(options)})`,
  );
  console.log(`Outputs: ${info.outputs.join(", ")}`);
  if (info.optionalOutputs && info.optionalOutputs.length > 0) {
    console.log(`Optional Outputs: ${info.optionalOutputs.join(", ")}`);
  }
  console.log(`Minimum data required: ${ti.emv.minData(options)}`);
  console.log(
  );
  console.log();

  const [outputs] = ti.emv.indicator([high, low, volume], options);
  console.log(`Full EMV Line: ${outputs[0]}`);

  const n = high.length - 5;
  const [outputs2, state2] = ti.emv.indicator(
    [high.slice(0, n), low.slice(0, n), volume.slice(0, n)],
    options,
  );
  console.log(`\nPartial EMV Line: ${outputs2[0]}`);
  console.log("\nDemonstrating state continuation...");
  console.log("State info: EMV State - internal state for Ease of Movement");
  const finalOutputs = state2.batchIndicator([
    high.slice(n),
    low.slice(n),
    volume.slice(n),
  ]);
  console.log(`Final EMV Line: ${finalOutputs[0]}`);
  console.log(
    `\nData split: ${n} + ${high.length - n} = ${high.length} total elements`,
  );

  console.log("\n" + "=".repeat(60));
  console.log("SIMD BY ASSETS DEMONSTRATION");
  console.log("=".repeat(60));
  const simdInputs = [
    [high.slice(), low.slice(), volume.slice()],
    [
      high.map((v) => v * 1.2),
      low.map((v) => v * 1.2),
      volume.map((v) => v * 1.2),
    ],
    [
      high.map((v, i) => 90 + i * 0.5 + v * 0.1),
      low.map((v, i) => 90 + i * 0.5 + v * 0.1),
      volume.map((v, i) => 90 + i * 0.5 + v * 0.1),
    ],
    [
      high.map((v, i) => 100 - i * 0.3 + v * 0.05),
      low.map((v, i) => 100 - i * 0.3 + v * 0.05),
      volume.map((v, i) => 100 - i * 0.3 + v * 0.05),
    ],
  ];
  console.log(
    `Processing ${simdInputs.length} assets simultaneously using SIMD...`,
  );
  console.log(
    "Asset 1: Original data\nAsset 2: Scaled up (+20% values)\nAsset 3: Different upward trend\nAsset 4: Downward trend\n",
  );
  try {
    const [simdOutputs] = ti.emv.simdByAssets(simdInputs, options);
    simdOutputs.forEach((output, i) =>
      console.log(`Asset ${i + 1} EMV values: ${output[0]}`),
    );
    console.log("\nVerification - calculating each asset individually:");
    simdInputs.forEach((inp, i) => {
      const [o] = ti.emv.indicator(inp, options);
      console.log(`Asset ${i + 1} individual: ${o[0]}`);
    });
    console.log("\nSIMD by Assets demonstration completed successfully!");
  } catch (e) {
    console.log(`SIMD by Assets error: ${e}`);
  }
  // No simdByOptions — indicator has no options

  // ── Optional Outputs ─────────────────────────────────────────────────────
  console.log('\n' + '='.repeat(60));
  console.log('OPTIONAL OUTPUTS');
  console.log('='.repeat(60));
  // Available: 'medprice'
  const _nBase = ti.emv.info.outputs.length;
  const _optNames = ti.emv.info.optionalOutputs;
  console.log(`Optional outputs: ${_optNames.join(', ')}`);
  console.log();

  // Enable all optional outputs
  const [_allOut] = ti.emv.indicator([high, low, volume], options, _optNames.map(() => true));
  console.log('All optional outputs enabled:');
  _optNames.forEach((n, i) => {
    console.log(`  ${n}: ${_allOut[_nBase + i]}`);
  });

  // Enable only the first optional output
  const [_firstOut] = ti.emv.indicator([high, low, volume], options, _optNames.map((_, i) => i === 0));
  console.log(`\nOnly '${_optNames[0]}' enabled:`);
  console.log(`  ${_optNames[0]}: ${_firstOut[_nBase]}`);
}

main();
