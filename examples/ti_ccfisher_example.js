/**
 * Node.js example for the CCFisher indicator from tulip-rs-node.
 * Cyber Cycle Fisher Transform converts cycle measurements into a Fisher Transform.
 * Optional outputs: trendmode, cycle, peak. Requires ~56 bars (use close80).
 */
import * as ti from '../index.js';

function main() {
  const close80 = Float64Array.from([
    81.59, 81.06, 82.87, 83.00, 83.61, 83.15, 82.84, 83.99, 84.55, 84.36,
    85.53, 86.54, 86.89, 87.77, 87.29, 87.50, 88.10, 88.50, 87.90, 88.20,
    88.80, 89.10, 88.70, 89.30, 89.70, 90.10, 89.50, 90.20, 90.80, 91.10,
    90.50, 91.20, 91.80, 92.10, 91.50, 92.20, 92.80, 93.10, 92.50, 93.20,
    93.80, 94.10, 93.50, 94.20, 94.80, 95.10, 94.50, 95.20, 95.80, 96.10,
    95.50, 96.20, 96.80, 97.10, 96.50, 97.20, 97.80, 98.10, 97.50, 98.20,
    98.80, 99.10, 98.50, 99.20, 99.80, 100.10, 99.50, 100.20, 100.80, 101.10,
    100.50, 101.20, 101.80, 102.10, 101.50, 102.20, 102.80, 103.10, 102.50, 103.20,
  ]);
  const options = [0.0];

  const info = ti.ccfisher.info;
  console.log(`=== ${info.name.toUpperCase()} (${info.fullName}) ===`);
  console.log(`Type: ${info.indicatorType}`);
  console.log(`Inputs: ${info.inputs.join(', ')}`);
  console.log(`Options: ${info.options.join(', ')} (current: ${JSON.stringify(options)})`);
  console.log(`Outputs: ${info.outputs.join(', ')}`);
  if (info.optionalOutputs && info.optionalOutputs.length > 0) {
    console.log(`Optional Outputs: ${info.optionalOutputs.join(', ')}`);
  }
  console.log(`Minimum data required: ${ti.ccfisher.minData(options)}`);
  console.log();

  const [outputs] = ti.ccfisher.indicator([close80], options);
  console.log(`Full CCFisher Value: ${outputs[0]}`);

  const n = close80.length - 5;
  const [outputs2, state2] = ti.ccfisher.indicator([close80.slice(0, n)], options);
  console.log(`\nPartial CCFisher Value: ${outputs2[0]}`);

  console.log('\nDemonstrating state continuation...');
  console.log('State info: CCFisher State - internal state for Cyber Cycle Fisher Transform');
  const finalOutputs = state2.batchIndicator([close80.slice(n)]);
  console.log(`Final CCFisher Value: ${finalOutputs[0]}`);
  console.log(`\nData split: ${n} + ${close80.length - n} = ${close80.length} total elements`);

  console.log('\n' + '='.repeat(60));
  console.log('SIMD BY ASSETS DEMONSTRATION');
  console.log('='.repeat(60));
  const simdInputs = [
    [close80.slice()],
    [close80.map(v => v * 1.2)],
    [close80.map((v, i) => 90 + i * 0.5 + v * 0.1)],
    [close80.map((v, i) => 100 - i * 0.3 + v * 0.05)],
  ];
  console.log(`Processing ${simdInputs.length} assets simultaneously using SIMD...`);
  console.log('Asset 1: Original data\nAsset 2: Scaled up (+20% values)\nAsset 3: Different upward trend\nAsset 4: Downward trend\n');
  try {
    const [simdOutputs] = ti.ccfisher.simdByAssets(simdInputs, options);
    simdOutputs.forEach((output, i) =>
      console.log(`Asset ${i + 1} CCFisher Value: ${output[0]}`));
    console.log('\nVerification - calculating each asset individually:');
    simdInputs.forEach((inp, i) => {
      const [o] = ti.ccfisher.indicator(inp, options);
      console.log(`Asset ${i + 1} individual: ${o[0]}`);
    });
    console.log('\nSIMD by Assets demonstration completed successfully!');
  } catch (e) { console.log(`SIMD by Assets error: ${e}`); }

  console.log('\n' + '='.repeat(60));
  console.log('SIMD BY OPTIONS DEMONSTRATION');
  console.log('='.repeat(60));
  const simdOptions = [[0.0], [0.05], [0.07], [0.1]];
  simdOptions.forEach((opt, i) => console.log(`Option set ${i + 1}: ${JSON.stringify(opt)}`));
  console.log();
  try {
    const [simdOptOutputs] = ti.ccfisher.simdByOptions([close80], simdOptions);
    simdOptOutputs.forEach((output, i) =>
      console.log(`Option set ${i + 1} CCFisher (first 5): ${output[0].slice(0, 5)}`));
    console.log('\nVerification - calculating each option set individually:');
    simdOptions.forEach((opt, i) => {
      const [o] = ti.ccfisher.indicator([close80], opt);
      console.log(`Option set ${i + 1} individual (first 5): ${o[0].slice(0, 5)}`);
    });
    console.log('\nSIMD by Options demonstration completed successfully!');
  } catch (e) { console.log(`SIMD by Options error: ${e}`); }

  // ── Optional Outputs ─────────────────────────────────────────────────────
  console.log('\n' + '='.repeat(60));
  console.log('OPTIONAL OUTPUTS');
  console.log('='.repeat(60));
  const _nBase = ti.ccfisher.info.outputs.length;
  const _optNames = ti.ccfisher.info.optionalOutputs;
  console.log(`Optional outputs: ${_optNames.join(', ')}`);
  console.log();

  const [_allOut] = ti.ccfisher.indicator([close80], options, _optNames.map(() => true));
  console.log('All optional outputs enabled:');
  _optNames.forEach((n, i) => {
    console.log(`  ${n}: ${_allOut[_nBase + i]}`);
  });

  const [_firstOut] = ti.ccfisher.indicator([close80], options, _optNames.map((_, i) => i === 0));
  console.log(`\nOnly '${_optNames[0]}' enabled:`);
  console.log(`  ${_optNames[0]}: ${_firstOut[_nBase]}`);
}

main();
