import * as ti from '../index.js';

function main() {
  const close = Float64Array.from([81.59, 81.06, 82.87, 83.00, 83.61, 83.15, 82.84, 83.99, 84.55, 84.36, 85.53, 86.54, 86.89, 87.77, 87.29]);
  const high  = Float64Array.from([82.15, 81.89, 83.03, 83.30, 83.85, 83.90, 83.33, 84.30, 84.84, 85.00, 85.90, 86.58, 86.98, 88.00, 87.87]);
  const low   = Float64Array.from([81.29, 80.64, 81.31, 82.65, 83.07, 83.11, 82.49, 82.30, 84.15, 84.11, 84.03, 85.39, 85.76, 87.17, 87.01]);
  const options = [5.0];

  const info = ti.adx.info;
  console.log(`=== ${info.name.toUpperCase()} (${info.fullName}) ===`);
  console.log(`Type: ${info.indicatorType}`);
  console.log(`Inputs: ${info.inputs.join(', ')}`);
  console.log(`Options: ${info.options.join(', ')} (current: ${JSON.stringify(options)})`);
  console.log(`Outputs: ${info.outputs.join(', ')}`);
  if (info.optionalOutputs && info.optionalOutputs.length > 0) console.log(`Optional Outputs: ${info.optionalOutputs.join(', ')}`);
  console.log(`Minimum data required: ${ti.adx.minData(options)}`);
  console.log();

  const [outputs] = ti.adx.indicator([high, low, close], options);
  console.log(`Full ADX Line: ${outputs[0]}`);

  const partialHigh = high.slice(0, -5);
  const partialLow = low.slice(0, -5);
  const partialClose = close.slice(0, -5);
  const [outputs2, state2] = ti.adx.indicator([partialHigh, partialLow, partialClose], options);
  console.log(`\nPartial ADX Line: ${outputs2[0]}`);
  console.log('\nDemonstrating state continuation...');
  console.log('State info: ADX State - internal state for Average Directional Movement Index');
  const newHigh = high.slice(-5);
  const newLow = low.slice(-5);
  const newClose = close.slice(-5);
  const finalOutputs = state2.batchIndicator([newHigh, newLow, newClose]);
  console.log(`Final ADX Line: ${finalOutputs[0]}`);
  console.log(`\nData split: ${partialHigh.length} + ${newHigh.length} = ${high.length} total elements`);

  console.log('\n' + '='.repeat(60));
  console.log('SIMD BY ASSETS DEMONSTRATION');
  console.log('='.repeat(60));
  const simdInputs = [
    [high.slice(), low.slice(), close.slice()],
    [high.map(v => v * 1.2), low.map(v => v * 1.2), close.map(v => v * 1.2)],
    [high.map((v, i) => 90 + i * 0.5 + v * 0.1), low.map((v, i) => 90 + i * 0.5 + v * 0.1), close.map((v, i) => 90 + i * 0.5 + v * 0.1)],
    [high.map((v, i) => 100 - i * 0.3 + v * 0.05), low.map((v, i) => 100 - i * 0.3 + v * 0.05), close.map((v, i) => 100 - i * 0.3 + v * 0.05)],
  ];
  console.log(`Processing ${simdInputs.length} assets simultaneously using SIMD...`);
  console.log('Asset 1: Original data\nAsset 2: Scaled up (+20% values)\nAsset 3: Different upward trend\nAsset 4: Downward trend\n');
  try {
    const [simdOutputs] = ti.adx.simdByAssets(simdInputs, options);
    simdOutputs.forEach((output, i) => console.log(`Asset ${i + 1} ADX values: ${output[0]}`));
    console.log('\nVerification - calculating each asset individually:');
    simdInputs.forEach((inp, i) => {
      const [o] = ti.adx.indicator(inp, options);
      console.log(`Asset ${i + 1} individual: ${o[0]}`);
    });
    console.log('\nSIMD by Assets demonstration completed successfully!');
  } catch (e) { console.log(`SIMD by Assets error: ${e}`); }

  console.log('\n' + '='.repeat(60));
  console.log('SIMD BY OPTIONS DEMONSTRATION');
  console.log('='.repeat(60));
  const expandedHigh = new Float64Array(Array.from({length:20}).flatMap(()=>Array.from(high)));
  const expandedLow = new Float64Array(Array.from({length:20}).flatMap(()=>Array.from(low)));
  const expandedClose = new Float64Array(Array.from({length:20}).flatMap(()=>Array.from(close)));
  const simdOptions = [[2], [5.0], [8], [10.0]];
  simdOptions.forEach((opt, i) => console.log(`Option set ${i + 1}: ${JSON.stringify(opt)}`));
  console.log();
  try {
    const [simdOptOutputs] = ti.adx.simdByOptions([expandedHigh, expandedLow, expandedClose], simdOptions);
    simdOptOutputs.forEach((output, i) => console.log(`Option set ${i + 1} ADX values (first 5): ${output[0].slice(0, 5)}`));
    console.log('\nVerification - calculating each option set individually:');
    simdOptions.forEach((opt, i) => {
      const [o] = ti.adx.indicator([expandedHigh, expandedLow, expandedClose], opt);
      console.log(`Option set ${i + 1} individual (first 5): ${o[0].slice(0, 5)}`);
    });
    console.log('\nSIMD by Options demonstration completed successfully!');
  } catch (e) { console.log(`SIMD by Options error: ${e}`); }

  // ── Optional Outputs ─────────────────────────────────────────────────────
  console.log('\n' + '='.repeat(60));
  console.log('OPTIONAL OUTPUTS');
  console.log('='.repeat(60));
  // Available: 'dx', 'atr', 'tr'
  const _nBase = ti.adx.info.outputs.length;
  const _optNames = ti.adx.info.optionalOutputs;
  console.log(`Optional outputs: ${_optNames.join(', ')}`);
  console.log();

  // Enable all optional outputs
  const [_allOut] = ti.adx.indicator([high, low, close], options, _optNames.map(() => true));
  console.log('All optional outputs enabled:');
  _optNames.forEach((n, i) => {
    console.log(`  ${n}: ${_allOut[_nBase + i]}`);
  });

  // Enable only the first optional output
  const [_firstOut] = ti.adx.indicator([high, low, close], options, _optNames.map((_, i) => i === 0));
  console.log(`\nOnly '${_optNames[0]}' enabled:`);
  console.log(`  ${_optNames[0]}: ${_firstOut[_nBase]}`);
  console.log(`  atr: [] (not requested)`);
}

main();
