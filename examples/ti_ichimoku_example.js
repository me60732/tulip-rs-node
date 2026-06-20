/**
 * Node.js example for the Ichimoku indicator from tulip-rs-node.
 * Ichimoku Cloud uses High, Low, Close inputs and outputs conversion/base lines
 * and leading spans. Optional output: lagging_span.
 */
import * as ti from "../index.js";

function main() {
  const high = Float64Array.from([
    82.15, 81.89, 83.03, 83.3, 83.85, 83.9, 83.33, 84.3, 84.84, 85.0, 85.9,
    86.58, 86.98, 88.0, 87.87, 88.2, 88.7, 89.1, 88.5, 89.0, 89.6, 89.9, 89.3,
    90.1, 90.5, 91.0, 90.3, 91.0, 91.6, 92.0, 91.3, 92.0, 92.6, 93.0, 92.3,
    93.0, 93.6, 94.0, 93.3, 94.1,
  ]);
  const low = Float64Array.from([
    81.29, 80.64, 81.31, 82.65, 83.07, 83.11, 82.49, 82.3, 84.15, 84.11, 84.03,
    85.39, 85.76, 87.17, 87.01, 87.2, 87.8, 88.2, 87.6, 88.0, 88.6, 88.9, 88.3,
    89.0, 89.4, 89.8, 89.2, 89.9, 90.5, 90.8, 90.2, 90.9, 91.5, 91.8, 91.2,
    91.9, 92.5, 92.8, 92.2, 92.9,
  ]);
  const close = Float64Array.from([
    81.59, 81.06, 82.87, 83.0, 83.61, 83.15, 82.84, 83.99, 84.55, 84.36, 85.53,
    86.54, 86.89, 87.77, 87.29, 87.5, 88.1, 88.5, 87.9, 88.2, 88.8, 89.1, 88.7,
    89.3, 89.7, 90.1, 89.5, 90.2, 90.8, 91.1, 90.5, 91.2, 91.8, 92.1, 91.5,
    92.2, 92.8, 93.1, 92.5, 93.2,
  ]);
  const options = [5.0, 10.0];

  const info = ti.ichimoku.info;
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
  console.log(`Minimum data required: ${ti.ichimoku.minData(options)}`);
  console.log();

  const [outputs] = ti.ichimoku.indicator([high, low, close], options);
  info.outputs.forEach((name, i) =>
    console.log(`Full Ichimoku ${name}: ${outputs[i]}`),
  );

  const n = high.length - 5;
  const [outputs2, state2] = ti.ichimoku.indicator(
    [high.slice(0, n), low.slice(0, n), close.slice(0, n)],
    options,
  );
  console.log("\nPartial Ichimoku outputs:");
  info.outputs.forEach((name, i) => console.log(`  ${name}: ${outputs2[i]}`));

  console.log("\nDemonstrating state continuation...");
  console.log("State info: Ichimoku State - internal state for Ichimoku Cloud");
  const finalOutputs = state2.batchIndicator([
    high.slice(n),
    low.slice(n),
    close.slice(n),
  ]);
  console.log("Final Ichimoku outputs:");
  info.outputs.forEach((name, i) =>
    console.log(`  ${name}: ${finalOutputs[i]}`),
  );
  console.log(
    `\nData split: ${n} + ${high.length - n} = ${high.length} total elements`,
  );

  console.log("\n" + "=".repeat(60));
  console.log("SIMD BY ASSETS DEMONSTRATION");
  console.log("=".repeat(60));
  const simdInputs = [
    [high.slice(), low.slice(), close.slice()],
    [
      high.map((v) => v * 1.02),
      low.map((v) => v * 1.02),
      close.map((v) => v * 1.02),
    ],
    [
      high.map((v, i) => v + i * 0.1),
      low.map((v, i) => v + i * 0.1),
      close.map((v, i) => v + i * 0.1),
    ],
    [
      high.map((v, i) => v - i * 0.05),
      low.map((v, i) => v - i * 0.05),
      close.map((v, i) => v - i * 0.05),
    ],
  ];
  console.log(
    `Processing ${simdInputs.length} assets simultaneously using SIMD...`,
  );
  console.log(
    "Asset 1: Original data\nAsset 2: Scaled up (+2%)\nAsset 3: Gradual upward shift\nAsset 4: Gradual downward shift\n",
  );
  try {
    const [simdOutputs] = ti.ichimoku.simdByAssets(simdInputs, options);
    simdOutputs.forEach((output, i) =>
      console.log(`Asset ${i + 1} Ichimoku ${info.outputs[0]}: ${output[0]}`),
    );
    console.log("\nVerification - calculating each asset individually:");
    simdInputs.forEach((inp, i) => {
      const [o] = ti.ichimoku.indicator(inp, options);
      console.log(`Asset ${i + 1} individual ${info.outputs[0]}: ${o[0]}`);
    });
    console.log("\nSIMD by Assets demonstration completed successfully!");
  } catch (e) {
    console.log(`SIMD by Assets error: ${e}`);
  }

  console.log("\n" + "=".repeat(60));
  console.log("SIMD BY OPTIONS DEMONSTRATION");
  console.log("=".repeat(60));
  // Option sets chosen so every minData <= data length (40): formula is kijun_period * 3
  const simdOptions = [
    [3, 8],
    [5, 10],
    [5, 12],
    [6, 13],
  ];
  simdOptions.forEach((opt, i) =>
    console.log(`Option set ${i + 1}: ${JSON.stringify(opt)}`),
  );
  console.log();
  try {
    const [simdOptOutputs] = ti.ichimoku.simdByOptions(
      [high, low, close],
      simdOptions,
    );
    simdOptOutputs.forEach((output, i) =>
      console.log(
        `Option set ${i + 1} Ichimoku ${info.outputs[0]} (first 5): ${output[0].slice(0, 5)}`,
      ),
    );
    console.log("\nVerification - calculating each option set individually:");
    simdOptions.forEach((opt, i) => {
      const [o] = ti.ichimoku.indicator([high, low, close], opt);
      console.log(
        `Option set ${i + 1} individual ${info.outputs[0]} (first 5): ${o[0].slice(0, 5)}`,
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
  const _nBase = ti.ichimoku.info.outputs.length;
  const _optNames = ti.ichimoku.info.optionalOutputs;
  console.log(`Optional outputs: ${_optNames.join(", ")}`);
  console.log();

  const [_allOut] = ti.ichimoku.indicator(
    [high, low, close],
    options,
    _optNames.map(() => true),
  );
  console.log("All optional outputs enabled:");
  _optNames.forEach((n, i) => {
    console.log(`  ${n}: ${_allOut[_nBase + i]}`);
  });

  const [_firstOut] = ti.ichimoku.indicator(
    [high, low, close],
    options,
    _optNames.map((_, i) => i === 0),
  );
  console.log(`\nOnly '${_optNames[0]}' enabled:`);
  console.log(`  ${_optNames[0]}: ${_firstOut[_nBase]}`);
}

main();
