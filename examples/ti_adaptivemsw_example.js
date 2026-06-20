/**
 * Node.js example for the AdaptiveMSW indicator from tulip-rs-node.
 * Adaptive Mesa Sine Wave adapts the dominant cycle period automatically.
 * Returns two outputs: Sine and Lead. Optional output: dc_period.
 */
import * as ti from '../index.js';

function main() {
  const close = Float64Array.from([
    81.59, 81.06, 82.87, 83.00, 83.61, 83.15, 82.84, 83.99, 84.55, 84.36,
    85.53, 86.54, 86.89, 87.77, 87.29, 87.50, 88.10, 88.50, 87.90, 88.20,
    88.80, 89.10, 88.70, 89.30, 89.70, 90.10, 89.50, 90.20, 90.80, 91.10,
    90.50, 91.20, 91.80, 92.10, 91.50, 92.20, 92.80, 93.10, 92.50, 93.20,
  ]);
  const options = [];

  const info = ti.adaptivemsw.info;
  console.log(`=== ${info.name.toUpperCase()} (${info.fullName}) ===`);
  console.log(`Type: ${info.indicatorType}`);
  console.log(`Inputs: ${info.inputs.join(', ')}`);
  console.log(`Options: ${info.options.length > 0 ? info.options.join(', ') : 'none'} (current: ${JSON.stringify(options)})`);
  console.log(`Outputs: ${info.outputs.join(', ')}`);
  if (info.optionalOutputs && info.optionalOutputs.length > 0) {
    console.log(`Optional Outputs: ${info.optionalOutputs.join(', ')}`);
  }
  console.log(`Minimum data required: ${ti.adaptivemsw.minData(options)}`);
  console.log();

  const [outputs] = ti.adaptivemsw.indicator([close], options);
  console.log(`Full AdaptiveMSW Sine: ${outputs[0]}`);
  console.log(`Full AdaptiveMSW Lead: ${outputs[1]}`);

  const n = close.length - 5;
  const [outputs2, state2] = ti.adaptivemsw.indicator([close.slice(0, n)], options);
  console.log(`\nPartial AdaptiveMSW Sine: ${outputs2[0]}`);
  console.log(`Partial AdaptiveMSW Lead: ${outputs2[1]}`);

  console.log('\nDemonstrating state continuation...');
  console.log('State info: AdaptiveMSW State - internal state for Adaptive Mesa Sine Wave');
  const finalOutputs = state2.batchIndicator([close.slice(n)]);
  console.log(`Final AdaptiveMSW Sine: ${finalOutputs[0]}`);
  console.log(`Final AdaptiveMSW Lead: ${finalOutputs[1]}`);
  console.log(`\nData split: ${n} + ${close.length - n} = ${close.length} total elements`);

  console.log('\n' + '='.repeat(60));
  console.log('SIMD BY ASSETS DEMONSTRATION');
  console.log('='.repeat(60));
  const simdInputs = [
    [close.slice()],
    [close.map(v => v * 1.2)],
    [close.map((v, i) => 90 + i * 0.5 + v * 0.1)],
    [close.map((v, i) => 100 - i * 0.3 + v * 0.05)],
  ];
  console.log(`Processing ${simdInputs.length} assets simultaneously using SIMD...`);
  console.log('Asset 1: Original data\nAsset 2: Scaled up (+20% values)\nAsset 3: Different upward trend\nAsset 4: Downward trend\n');
  try {
    const [simdOutputs] = ti.adaptivemsw.simdByAssets(simdInputs, options);
    simdOutputs.forEach((output, i) =>
      console.log(`Asset ${i + 1} AdaptiveMSW Sine: ${output[0]}, Lead: ${output[1]}`));
    console.log('\nVerification - calculating each asset individually:');
    simdInputs.forEach((inp, i) => {
      const [o] = ti.adaptivemsw.indicator(inp, options);
      console.log(`Asset ${i + 1} individual Sine: ${o[0]}, Lead: ${o[1]}`);
    });
    console.log('\nSIMD by Assets demonstration completed successfully!');
  } catch (e) { console.log(`SIMD by Assets error: ${e}`); }

  // No simdByOptions — indicator has no options

  // ── Optional Outputs ─────────────────────────────────────────────────────
  console.log('\n' + '='.repeat(60));
  console.log('OPTIONAL OUTPUTS');
  console.log('='.repeat(60));
  const _nBase = ti.adaptivemsw.info.outputs.length;
  const _optNames = ti.adaptivemsw.info.optionalOutputs;
  console.log(`Optional outputs: ${_optNames.join(', ')}`);
  console.log();

  const [_allOut] = ti.adaptivemsw.indicator([close], options, _optNames.map(() => true));
  console.log('All optional outputs enabled:');
  _optNames.forEach((n, i) => {
    console.log(`  ${n}: ${_allOut[_nBase + i]}`);
  });

  const [_firstOut] = ti.adaptivemsw.indicator([close], options, _optNames.map((_, i) => i === 0));
  console.log(`\nOnly '${_optNames[0]}' enabled:`);
  console.log(`  ${_optNames[0]}: ${_firstOut[_nBase]}`);
}

main();
