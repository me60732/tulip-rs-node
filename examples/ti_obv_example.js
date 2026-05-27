"use strict";
/**
 * Node.js example for the OBV indicator from tulip-rs-node.
 * On Balance Volume uses Close, Volume inputs with no options.
 */
const ti = require("../index");

function main() {
  const close = [
    81.59, 81.06, 82.87, 83.0, 83.61, 83.15, 82.84, 83.99, 84.55, 84.36, 85.53,
    86.54, 86.89, 87.77, 87.29,
  ];
  const volume = [
    5653100, 6447400, 7690900, 3831400, 4455100, 3798000, 3936200, 4732000,
    4841300, 3915300, 6830800, 6694100, 5293600, 7985800, 4807900,
  ];
  const options = [];

  const info = ti.obv.info;
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
  console.log(`Minimum data required: ${ti.obv.minData()}`);
  console.log(
    `Minimum data for accuracy (6 decimals): ${ti.obv.minDataAccuracy(6)}`,
  );
  console.log();

  const [outputs] = ti.obv.indicator([close, volume]);
  console.log(`Full OBV Line: ${outputs[0]}`);

  const n = close.length - 5;
  const [outputs2, state2] = ti.obv.indicator([
    close.slice(0, n),
    volume.slice(0, n),
  ]);
  console.log(`\nPartial OBV Line: ${outputs2[0]}`);
  console.log("\nDemonstrating state continuation...");
  console.log("State info: OBV State - internal state for On Balance Volume");
  const finalOutputs = state2.batchIndicator([close.slice(n), volume.slice(n)]);
  console.log(`Final OBV Line: ${finalOutputs[0]}`);
  console.log(
    `\nData split: ${n} + ${close.length - n} = ${close.length} total elements`,
  );

  console.log("\n" + "=".repeat(60));
  console.log("SIMD BY ASSETS DEMONSTRATION");
  console.log("=".repeat(60));
  const simdInputs = [
    [[...close], [...volume]],
    [close.map((v) => v * 1.2), volume.map((v) => v * 1.2)],
    [
      close.map((v, i) => 90 + i * 0.5 + v * 0.1),
      volume.map((v, i) => 90 + i * 0.5 + v * 0.1),
    ],
    [
      close.map((v, i) => 100 - i * 0.3 + v * 0.05),
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
    const [simdOutputs] = ti.obv.simdByAssets(simdInputs);
    simdOutputs.forEach((output, i) =>
      console.log(`Asset ${i + 1} OBV values: ${output[0]}`),
    );
    console.log("\nVerification - calculating each asset individually:");
    simdInputs.forEach((inp, i) => {
      const [o] = ti.obv.indicator(inp);
      console.log(`Asset ${i + 1} individual: ${o[0]}`);
    });
    console.log("\nSIMD by Assets demonstration completed successfully!");
  } catch (e) {
    console.log(`SIMD by Assets error: ${e}`);
  }
  // No simdByOptions — indicator has no options
}

main();
