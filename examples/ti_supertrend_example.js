/**
 * Node.js example for the SuperTrend indicator from tulip-rs-node.
 * SuperTrend uses ATR-based bands around a median price to generate trend signals.
 * Inputs: high, low, close. Optional outputs: atr, tr, medprice.
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
  const options = [7.0, 3.0];

  const info = ti.supertrend.info;
  console.log(`=== ${info.name.toUpperCase()} (${info.fullName}) ===`);
  console.log(`Type: ${info.indicatorType}`);
  console.log(`Inputs: ${info.inputs.join(', ')}`);
  console.log(`Options: ${info.options.join(', ')} (current: ${JSON.stringify(options)})`);
  console.log(`Outputs: ${info.outputs.join(', ')}`);
  if (info.optionalOutputs && info.optionalOutputs.length > 0) {
    console.log(`Optional Outputs: ${info.optionalOutputs.join(', ')}`);
  }
  console.log(`Minimum data required: ${ti.supertrend.minData(options)}`);
  console.log();

  const [outputs] = ti.supertrend.indicator([high, low, close], options);
  info.outputs.forEach((name, i) => console.log(`Full SuperTrend ${name}: ${outputs[i]}`));

  const n = high.length - 5;
  const [outputs2, state2] = ti.supertrend.indicator(
    [high.slice(0, n), low.slice(0, n), close.slice(0, n)],
    options,
  );
  console.log('\nPartial SuperTrend outputs:');
  info.outputs.forEach((name, i) => console.log(`  ${name}: ${outputs2[i]}`));

  console.log('\nDemonstrating state continuation...');
  console.log('State info: SuperTrend State - internal state for SuperTrend');
  const finalOutputs = state2.batchIndicator([high.slice(n), low.slice(n), close.slice(n)]);
  console.log('Final SuperTrend outputs:');
  info.outputs.forEach((name, i) => console.log(`  ${name}: ${finalOutputs[i]}`));
  console.log(`\nData split: ${n} + ${high.length - n} = ${high.length} total elements`);

  console.log('\n' + '='.repeat(60));
  console.log('SIMD BY ASSETS DEMONSTRATION');
  console.log('='.repeat(60));
  const simdInputs = [
    [high.slice(), low.slice(), close.slice()],
    [high.map(v => v * 1.02), low.map(v => v * 1.02), close.map(v => v * 1.02)],
    [high.map((v, i) => v + i * 0.1), low.map((v, i) => v + i * 0.1), close.map((v, i) => v + i * 0.1)],
    [high.map((v, i) => v - i * 0.05), low.map((v, i) => v - i * 0.05), close.map((v, i) => v - i * 0.05)],
  ];
  console.log(`Processing ${simdInputs.length} assets simultaneously using SIMD...`);
  console.log('Asset 1: Original data\nAsset 2: Scaled up (+2%)\nAsset 3: Gradual upward shift\nAsset 4: Gradual downward shift\n');
  try {
    const [simdOutputs] = ti.supertrend.simdByAssets(simdInputs, options);
    simdOutputs.forEach((output, i) =>
      console.log(`Asset ${i + 1} SuperTrend ${info.outputs[0]}: ${output[0]}`));
    console.log('\nVerification - calculating each asset individually:');
    simdInputs.forEach((inp, i) => {
      const [o] = ti.supertrend.indicator(inp, options);
      console.log(`Asset ${i + 1} individual ${info.outputs[0]}: ${o[0]}`);
    });
    console.log('\nSIMD by Assets demonstration completed successfully!');
  } catch (e) { console.log(`SIMD by Assets error: ${e}`); }

  console.log('\n' + '='.repeat(60));
  console.log('SIMD BY OPTIONS DEMONSTRATION');
  console.log('='.repeat(60));
  const simdOptions = [[5, 2], [7, 3], [10, 2.5], [14, 2]];
  simdOptions.forEach((opt, i) => console.log(`Option set ${i + 1}: ${JSON.stringify(opt)}`));
  console.log();
  try {
    const [simdOptOutputs] = ti.supertrend.simdByOptions([high, low, close], simdOptions);
    simdOptOutputs.forEach((output, i) =>
      console.log(`Option set ${i + 1} SuperTrend ${info.outputs[0]} (first 5): ${output[0].slice(0, 5)}`));
    console.log('\nVerification - calculating each option set individually:');
    simdOptions.forEach((opt, i) => {
      const [o] = ti.supertrend.indicator([high, low, close], opt);
      console.log(`Option set ${i + 1} individual ${info.outputs[0]} (first 5): ${o[0].slice(0, 5)}`);
    });
    console.log('\nSIMD by Options demonstration completed successfully!');
  } catch (e) { console.log(`SIMD by Options error: ${e}`); }

  // ── Optional Outputs ─────────────────────────────────────────────────────
  console.log('\n' + '='.repeat(60));
  console.log('OPTIONAL OUTPUTS');
  console.log('='.repeat(60));
  const _nBase = ti.supertrend.info.outputs.length;
  const _optNames = ti.supertrend.info.optionalOutputs;
  console.log(`Optional outputs: ${_optNames.join(', ')}`);
  console.log();

  const [_allOut] = ti.supertrend.indicator([high, low, close], options, _optNames.map(() => true));
  console.log('All optional outputs enabled:');
  _optNames.forEach((n, i) => {
    console.log(`  ${n}: ${_allOut[_nBase + i]}`);
  });

  const [_firstOut] = ti.supertrend.indicator([high, low, close], options, _optNames.map((_, i) => i === 0));
  console.log(`\nOnly '${_optNames[0]}' enabled:`);
  console.log(`  ${_optNames[0]}: ${_firstOut[_nBase]}`);
}

main();
