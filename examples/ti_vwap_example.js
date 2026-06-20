/**
 * Node.js example for the VWAP indicator from tulip-rs-node.
 * Volume Weighted Average Price uses High, Low, Close, Volume and computes the
 * average price weighted by volume. No options. Optional output: typprice.
 */
import * as ti from '../index.js';

function main() {
  const high = Float64Array.from([
    82.15, 81.89, 83.03, 83.30, 83.85, 83.90, 83.33, 84.30, 84.84, 85.00,
    85.90, 86.58, 86.98, 88.00, 87.87, 88.20, 88.70, 89.10, 88.50, 89.00,
    89.60, 89.90, 89.30, 90.10, 90.50, 91.00, 90.30, 91.00, 91.60, 92.00,
    91.30, 92.00, 92.60, 93.00, 92.30, 93.00, 93.60, 94.00, 93.30, 94.10,
  ]);
  const low = Float64Array.from([
    81.29, 80.64, 81.31, 82.65, 83.07, 83.11, 82.49, 82.30, 84.15, 84.11,
    84.03, 85.39, 85.76, 87.17, 87.01, 87.20, 87.80, 88.20, 87.60, 88.00,
    88.60, 88.90, 88.30, 89.00, 89.40, 89.80, 89.20, 89.90, 90.50, 90.80,
    90.20, 90.90, 91.50, 91.80, 91.20, 91.90, 92.50, 92.80, 92.20, 92.90,
  ]);
  const close = Float64Array.from([
    81.59, 81.06, 82.87, 83.00, 83.61, 83.15, 82.84, 83.99, 84.55, 84.36,
    85.53, 86.54, 86.89, 87.77, 87.29, 87.50, 88.10, 88.50, 87.90, 88.20,
    88.80, 89.10, 88.70, 89.30, 89.70, 90.10, 89.50, 90.20, 90.80, 91.10,
    90.50, 91.20, 91.80, 92.10, 91.50, 92.20, 92.80, 93.10, 92.50, 93.20,
  ]);
  const volume = Float64Array.from([
    5653100, 6447400, 7690900, 3831400, 4455100, 3798000, 3936200, 4732000,
    4841300, 3915300, 6830800, 6694100, 5293600, 7985800, 4807900, 5100000,
    5300000, 4900000, 5200000, 4800000, 5600000, 5800000, 5400000, 6000000,
    6200000, 5800000, 6400000, 6600000, 6200000, 6800000, 7000000, 6600000,
    7200000, 7400000, 7000000, 7600000, 7800000, 7400000, 8000000, 8200000,
  ]);
  const options = [];

  const info = ti.vwap.info;
  console.log(`=== ${info.name.toUpperCase()} (${info.fullName}) ===`);
  console.log(`Type: ${info.indicatorType}`);
  console.log(`Inputs: ${info.inputs.join(', ')}`);
  console.log(`Options: ${info.options.length > 0 ? info.options.join(', ') : 'none'} (current: ${JSON.stringify(options)})`);
  console.log(`Outputs: ${info.outputs.join(', ')}`);
  if (info.optionalOutputs && info.optionalOutputs.length > 0) {
    console.log(`Optional Outputs: ${info.optionalOutputs.join(', ')}`);
  }
  console.log(`Minimum data required: ${ti.vwap.minData(options)}`);
  console.log();

  const [outputs] = ti.vwap.indicator([high, low, close, volume], options);
  console.log(`Full VWAP: ${outputs[0]}`);

  const n = high.length - 5;
  const [outputs2, state2] = ti.vwap.indicator(
    [high.slice(0, n), low.slice(0, n), close.slice(0, n), volume.slice(0, n)],
    options,
  );
  console.log(`\nPartial VWAP: ${outputs2[0]}`);

  console.log('\nDemonstrating state continuation...');
  console.log('State info: VWAP State - internal state for Volume Weighted Average Price');
  const finalOutputs = state2.batchIndicator([
    high.slice(n), low.slice(n), close.slice(n), volume.slice(n),
  ]);
  console.log(`Final VWAP: ${finalOutputs[0]}`);
  console.log(`\nData split: ${n} + ${high.length - n} = ${high.length} total elements`);

  console.log('\n' + '='.repeat(60));
  console.log('SIMD BY ASSETS DEMONSTRATION');
  console.log('='.repeat(60));
  const simdInputs = [
    [high.slice(), low.slice(), close.slice(), volume.slice()],
    [
      high.map(v => v * 1.02),
      low.map(v => v * 1.02),
      close.map(v => v * 1.02),
      volume.map(v => v * 1.1),
    ],
    [
      high.map((v, i) => v + i * 0.1),
      low.map((v, i) => v + i * 0.1),
      close.map((v, i) => v + i * 0.1),
      volume.map(v => v * 0.9),
    ],
    [
      high.map((v, i) => v - i * 0.05),
      low.map((v, i) => v - i * 0.05),
      close.map((v, i) => v - i * 0.05),
      volume.map(v => v * 1.05),
    ],
  ];
  console.log(`Processing ${simdInputs.length} assets simultaneously using SIMD...`);
  console.log('Asset 1: Original data\nAsset 2: Scaled up (+2% price, +10% volume)\nAsset 3: Gradual upward shift\nAsset 4: Gradual downward shift\n');
  try {
    const [simdOutputs] = ti.vwap.simdByAssets(simdInputs, options);
    simdOutputs.forEach((output, i) =>
      console.log(`Asset ${i + 1} VWAP: ${output[0]}`));
    console.log('\nVerification - calculating each asset individually:');
    simdInputs.forEach((inp, i) => {
      const [o] = ti.vwap.indicator(inp, options);
      console.log(`Asset ${i + 1} individual VWAP: ${o[0]}`);
    });
    console.log('\nSIMD by Assets demonstration completed successfully!');
  } catch (e) { console.log(`SIMD by Assets error: ${e}`); }

  // No simdByOptions — indicator has no options

  // ── Optional Outputs ─────────────────────────────────────────────────────
  console.log('\n' + '='.repeat(60));
  console.log('OPTIONAL OUTPUTS');
  console.log('='.repeat(60));
  const _nBase = ti.vwap.info.outputs.length;
  const _optNames = ti.vwap.info.optionalOutputs;
  console.log(`Optional outputs: ${_optNames.join(', ')}`);
  console.log();

  const [_allOut] = ti.vwap.indicator([high, low, close, volume], options, _optNames.map(() => true));
  console.log('All optional outputs enabled:');
  _optNames.forEach((n, i) => {
    console.log(`  ${n}: ${_allOut[_nBase + i]}`);
  });

  const [_firstOut] = ti.vwap.indicator([high, low, close, volume], options, _optNames.map((_, i) => i === 0));
  console.log(`\nOnly '${_optNames[0]}' enabled:`);
  console.log(`  ${_optNames[0]}: ${_firstOut[_nBase]}`);
}

main();
