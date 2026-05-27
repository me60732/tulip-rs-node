/**
 * Node.js example for the AO indicator from tulip-rs-node.
 * Awesome Oscillator uses High, Low inputs with no options.
 * Note: AO requires at least 35 bars (5-period and 34-period SMAs);
 * the standard 15-bar data is therefore repeated to produce enough input.
 */
import * as ti from "../index.js";

function main() {
  const highBase = [
    82.15, 81.89, 83.03, 83.3, 83.85, 83.9, 83.33, 84.3, 84.84, 85.0, 85.9,
    86.58, 86.98, 88.0, 87.87,
  ];
  const lowBase = [
    81.29, 80.64, 81.31, 82.65, 83.07, 83.11, 82.49, 82.3, 84.15, 84.11, 84.03,
    85.39, 85.76, 87.17, 87.01,
  ];
  const options = [];

  // Expand to 45 bars (3 × 15) so AO (minData=35) can produce output
  const high = Array(3).fill(highBase).flat();
  const low = Array(3).fill(lowBase).flat();

  const info = ti.ao.info;
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
  console.log(`Minimum data required: ${ti.ao.minData()}`);
  console.log(
    `Minimum data for accuracy (6 decimals): ${ti.ao.minDataAccuracy(6)}`,
  );
  console.log(
    `Input length used: ${high.length} bars (standard 15-bar data × 3)`,
  );
  console.log();

  const [outputs] = ti.ao.indicator([high, low]);
  console.log(`Full AO Line: ${outputs[0]}`);

  const n = high.length - 5;
  const [outputs2, state2] = ti.ao.indicator([
    high.slice(0, n),
    low.slice(0, n),
  ]);
  console.log(`\nPartial AO Line: ${outputs2[0]}`);
  console.log("\nDemonstrating state continuation...");
  console.log("State info: AO State - internal state for Awesome Oscillator");
  const finalOutputs = state2.batchIndicator([high.slice(n), low.slice(n)]);
  console.log(`Final AO Line: ${finalOutputs[0]}`);
  console.log(
    `\nData split: ${n} + ${high.length - n} = ${high.length} total elements`,
  );

  console.log("\n" + "=".repeat(60));
  console.log("SIMD BY ASSETS DEMONSTRATION");
  console.log("=".repeat(60));
  const simdInputs = [
    [[...high], [...low]],
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
  console.log(
    "Asset 1: Original data\nAsset 2: Scaled up (+20% values)\nAsset 3: Different upward trend\nAsset 4: Downward trend\n",
  );
  try {
    const [simdOutputs] = ti.ao.simdByAssets(simdInputs);
    simdOutputs.forEach((output, i) =>
      console.log(`Asset ${i + 1} AO values: ${output[0]}`),
    );
    console.log("\nVerification - calculating each asset individually:");
    simdInputs.forEach((inp, i) => {
      const [o] = ti.ao.indicator(inp);
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
  // Available: 'short_sma', 'long_sma', 'medprice'
  const _nBase = ti.ao.info.outputs.length;
  const _optNames = ti.ao.info.optionalOutputs;
  console.log(`Optional outputs: ${_optNames.join(', ')}`);
  console.log();

  // Enable all optional outputs
  const [_allOut] = ti.ao.indicator([high, low], options, _optNames.map(() => true));
  console.log('All optional outputs enabled:');
  _optNames.forEach((n, i) => {
    console.log(`  ${n}: ${_allOut[_nBase + i]}`);
  });

  // Enable only the first optional output
  const [_firstOut] = ti.ao.indicator([high, low], options, _optNames.map((_, i) => i === 0));
  console.log(`\nOnly '${_optNames[0]}' enabled:`);
  console.log(`  ${_optNames[0]}: ${_firstOut[_nBase]}`);
  console.log(`  long_sma: [] (not requested)`);
}

main();
