/**
 * Node.js example for the TRVI (True Range Volatility Indicator) from tulip-rs-node.
 * Uses High, Low, Close inputs with a period option.
 * Outputs: trvi. Optional outputs: tr, ema.
 */
import * as ti from '../index.js';

function main() {
  const high   = [82.15, 81.89, 83.03, 83.30, 83.85, 83.90, 83.33, 84.30, 84.84, 85.00, 85.90, 86.58, 86.98, 88.00, 87.87, 88.50, 89.20, 89.75, 90.10, 89.80];
  const low    = [81.29, 80.64, 81.31, 82.65, 83.07, 83.11, 82.49, 82.30, 84.15, 84.11, 84.03, 85.39, 85.76, 87.17, 87.01, 87.60, 88.15, 88.90, 89.40, 88.95];
  const close  = [81.59, 81.06, 82.87, 83.00, 83.61, 83.15, 82.84, 83.99, 84.55, 84.36, 85.53, 86.54, 86.89, 87.77, 87.29, 88.10, 88.80, 89.50, 89.95, 89.25];
  const options = [5.0];

  const info = ti.trvi.info;
  console.log(`=== ${info.name.toUpperCase()} (${info.fullName}) ===`);
  console.log(`Type: ${info.indicatorType}`);
  console.log(`Inputs: ${info.inputs.join(', ')}`);
  console.log(`Options: ${info.options.length > 0 ? info.options.join(', ') : 'none'} (current: ${JSON.stringify(options)})`);
  console.log(`Outputs: ${info.outputs.join(', ')}`);
  if (info.optionalOutputs && info.optionalOutputs.length > 0) {
    console.log(`Optional Outputs: ${info.optionalOutputs.join(', ')}`);
  }
  console.log(`Minimum data required: ${ti.trvi.minData(options)}`);
  console.log(`Minimum data for accuracy (6 decimals): ${ti.trvi.minDataAccuracy(options, 6)}`);
  console.log();

  const [outputs] = ti.trvi.indicator([high, low, close], options);
  console.log(`Full TRVI Line: ${outputs[0]}`);

  const n = high.length - 5;
  const [outputs2, state2] = ti.trvi.indicator(
    [high.slice(0, n), low.slice(0, n), close.slice(0, n)],
    options
  );
  console.log(`\nPartial TRVI Line: ${outputs2[0]}`);
  console.log('\nDemonstrating state continuation...');
  console.log('State info: TRVI State - internal state for True Range Volatility Indicator');
  const finalOutputs = state2.batchIndicator([high.slice(n), low.slice(n), close.slice(n)]);
  console.log(`Final TRVI Line: ${finalOutputs[0]}`);
  console.log(`\nData split: ${n} + ${high.length - n} = ${high.length} total elements`);

  console.log('\n' + '='.repeat(60));
  console.log('SIMD BY ASSETS DEMONSTRATION');
  console.log('='.repeat(60));
  const simdInputs = [
    [[...high], [...low], [...close]],
    [high.map(v => v * 1.2), low.map(v => v * 1.2), close.map(v => v * 1.2)],
    [high.map((v, i) => 90 + i * 0.5 + v * 0.1), low.map((v, i) => 90 + i * 0.5 + v * 0.1), close.map((v, i) => 90 + i * 0.5 + v * 0.1)],
    [high.map((v, i) => 100 - i * 0.3 + v * 0.05), low.map((v, i) => 100 - i * 0.3 + v * 0.05), close.map((v, i) => 100 - i * 0.3 + v * 0.05)],
  ];
  console.log(`Processing ${simdInputs.length} assets simultaneously using SIMD...`);
  console.log('Asset 1: Original data\nAsset 2: Scaled up (+20% values)\nAsset 3: Different upward trend\nAsset 4: Downward trend\n');
  try {
    const [simdOutputs] = ti.trvi.simdByAssets(simdInputs, options);
    simdOutputs.forEach((output, i) => console.log(`Asset ${i + 1} TRVI values: ${output[0]}`));
    console.log('\nVerification - calculating each asset individually:');
    simdInputs.forEach((inp, i) => {
      const [o] = ti.trvi.indicator(inp, options);
      console.log(`Asset ${i + 1} individual: ${o[0]}`);
    });
    console.log('\nSIMD by Assets demonstration completed successfully!');
  } catch (e) { console.log(`SIMD by Assets error: ${e}`); }

  console.log('\n' + '='.repeat(60));
  console.log('SIMD BY OPTIONS DEMONSTRATION');
  console.log('='.repeat(60));
  const expandedHigh  = Array(20).fill(high).flat();
  const expandedLow   = Array(20).fill(low).flat();
  const expandedClose = Array(20).fill(close).flat();
  const simdOptions = [[3.0], [5.0], [8.0], [10.0]];
  console.log(`Processing ${simdOptions.length} option sets simultaneously using SIMD...`);
  simdOptions.forEach((opt, i) => console.log(`Option set ${i + 1}: ${JSON.stringify(opt)}`));
  console.log();
  try {
    const [simdOptOutputs] = ti.trvi.simdByOptions([expandedHigh, expandedLow, expandedClose], simdOptions);
    simdOptOutputs.forEach((output, i) => console.log(`Option set ${i + 1} TRVI values (first 5): ${output[0].slice(0, 5)}`));
    console.log('\nVerification - calculating each option set individually:');
    simdOptions.forEach((opt, i) => {
      const [o] = ti.trvi.indicator([expandedHigh, expandedLow, expandedClose], opt);
      console.log(`Option set ${i + 1} individual (first 5): ${o[0].slice(0, 5)}`);
    });
    console.log('\nSIMD by Options demonstration completed successfully!');
  } catch (e) { console.log(`SIMD by Options error: ${e}`); }

  // ── Optional Outputs ─────────────────────────────────────────────────────
  console.log('\n' + '='.repeat(60));
  console.log('OPTIONAL OUTPUTS');
  console.log('='.repeat(60));
  const _nBase = ti.trvi.info.outputs.length;
  const _optNames = ti.trvi.info.optionalOutputs;
  console.log(`Optional outputs: ${_optNames.join(', ')}`);
  console.log();

  // Enable all optional outputs
  const [_allOut] = ti.trvi.indicator([high, low, close], options, _optNames.map(() => true));
  console.log('All optional outputs enabled:');
  _optNames.forEach((n, i) => {
    console.log(`  ${n}: ${_allOut[_nBase + i]}`);
  });

  // Enable only the first optional output
  const [_firstOut] = ti.trvi.indicator([high, low, close], options, _optNames.map((_, i) => i === 0));
  console.log(`\nOnly '${_optNames[0]}' enabled:`);
  console.log(`  ${_optNames[0]}: ${_firstOut[_nBase]}`);
}

main();
