/**
 * Node.js example for the VOSC indicator from tulip-rs-node.
 * Volume Oscillator uses a single Volume input with short and long period options.
 */
import * as ti from '../index.js';

function main() {
  const volume = Float64Array.from([5653100, 6447400, 7690900, 3831400, 4455100, 3798000, 3936200, 4732000, 4841300, 3915300, 6830800, 6694100, 5293600, 7985800, 4807900]);
  const options = [2.0, 5.0];

  const info = ti.vosc.info;
  console.log(`=== ${info.name.toUpperCase()} (${info.fullName}) ===`);
  console.log(`Type: ${info.indicatorType}`);
  console.log(`Inputs: ${info.inputs.join(', ')}`);
  console.log(`Options: ${info.options.length > 0 ? info.options.join(', ') : 'none'} (current: ${JSON.stringify(options)})`);
  console.log(`Outputs: ${info.outputs.join(', ')}`);
  if (info.optionalOutputs && info.optionalOutputs.length > 0) {
    console.log(`Optional Outputs: ${info.optionalOutputs.join(', ')}`);
  }
  console.log(`Minimum data required: ${ti.vosc.minData(options)}`);
  console.log(`Minimum data for accuracy (6 decimals): ${ti.vosc.minDataAccuracy(options, 6)}`);
  console.log();

  const [outputs] = ti.vosc.indicator([volume], options);
  console.log(`Full VOSC Line: ${outputs[0]}`);

  const n = volume.length - 5;
  const [outputs2, state2] = ti.vosc.indicator(
    [volume.slice(0, n)],
    options
  );
  console.log(`\nPartial VOSC Line: ${outputs2[0]}`);
  console.log('\nDemonstrating state continuation...');
  console.log('State info: VOSC State - internal state for Volume Oscillator');
  const finalOutputs = state2.batchIndicator([volume.slice(n)]);
  console.log(`Final VOSC Line: ${finalOutputs[0]}`);
  console.log(`\nData split: ${n} + ${volume.length - n} = ${volume.length} total elements`);

  console.log('\n' + '='.repeat(60));
  console.log('SIMD BY ASSETS DEMONSTRATION');
  console.log('='.repeat(60));
  const simdInputs = [
    [volume.slice()],
    [volume.map(v => v * 1.2)],
    [volume.map((v, i) => 90 + i * 0.5 + v * 0.1)],
    [volume.map((v, i) => 100 - i * 0.3 + v * 0.05)],
  ];
  console.log(`Processing ${simdInputs.length} assets simultaneously using SIMD...`);
  console.log('Asset 1: Original data\nAsset 2: Scaled up (+20% values)\nAsset 3: Different upward trend\nAsset 4: Downward trend\n');
  try {
    const [simdOutputs] = ti.vosc.simdByAssets(simdInputs, options);
    simdOutputs.forEach((output, i) => console.log(`Asset ${i + 1} VOSC values: ${output[0]}`));
    console.log('\nVerification - calculating each asset individually:');
    simdInputs.forEach((inp, i) => {
      const [o] = ti.vosc.indicator(inp, options);
      console.log(`Asset ${i + 1} individual: ${o[0]}`);
    });
    console.log('\nSIMD by Assets demonstration completed successfully!');
  } catch (e) { console.log(`SIMD by Assets error: ${e}`); }

  console.log('\n' + '='.repeat(60));
  console.log('SIMD BY OPTIONS DEMONSTRATION');
  console.log('='.repeat(60));
  const expandedVolume = new Float64Array(Array.from({length:20}).flatMap(()=>Array.from(volume)));
  const simdOptions = [[1, 3], [2.0, 5.0], [3, 7], [4.0, 10.0]];
  console.log(`Processing ${simdOptions.length} option sets simultaneously using SIMD...`);
  simdOptions.forEach((opt, i) => console.log(`Option set ${i + 1}: ${JSON.stringify(opt)}`));
  console.log();
  try {
    const [simdOptOutputs] = ti.vosc.simdByOptions([expandedVolume], simdOptions);
    simdOptOutputs.forEach((output, i) => console.log(`Option set ${i + 1} VOSC values (first 5): ${output[0].slice(0, 5)}`));
    console.log('\nVerification - calculating each option set individually:');
    simdOptions.forEach((opt, i) => {
      const [o] = ti.vosc.indicator([expandedVolume], opt);
      console.log(`Option set ${i + 1} individual (first 5): ${o[0].slice(0, 5)}`);
    });
    console.log('\nSIMD by Options demonstration completed successfully!');
  } catch (e) { console.log(`SIMD by Options error: ${e}`); }

  // ── Optional Outputs ─────────────────────────────────────────────────────
  console.log('\n' + '='.repeat(60));
  console.log('OPTIONAL OUTPUTS');
  console.log('='.repeat(60));
  // Available: 'short_sma', 'long_sma'
  const _nBase = ti.vosc.info.outputs.length;
  const _optNames = ti.vosc.info.optionalOutputs;
  console.log(`Optional outputs: ${_optNames.join(', ')}`);
  console.log();

  // Enable all optional outputs
  const [_allOut] = ti.vosc.indicator([volume], options, _optNames.map(() => true));
  console.log('All optional outputs enabled:');
  _optNames.forEach((n, i) => {
    console.log(`  ${n}: ${_allOut[_nBase + i]}`);
  });

  // Enable only the first optional output
  const [_firstOut] = ti.vosc.indicator([volume], options, _optNames.map((_, i) => i === 0));
  console.log(`\nOnly '${_optNames[0]}' enabled:`);
  console.log(`  ${_optNames[0]}: ${_firstOut[_nBase]}`);
  console.log(`  long_sma: [] (not requested)`);
}

main();
