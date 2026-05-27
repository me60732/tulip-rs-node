/**
 * Node.js example for the KVO indicator from tulip-rs-node.
 * Klinger Volume Oscillator uses High, Low, Close, Volume inputs
 * with fast and slow period options.
 */
import * as ti from '../index.js';

function main() {
  const close  = [81.59, 81.06, 82.87, 83.00, 83.61, 83.15, 82.84, 83.99, 84.55, 84.36, 85.53, 86.54, 86.89, 87.77, 87.29];
  const high   = [82.15, 81.89, 83.03, 83.30, 83.85, 83.90, 83.33, 84.30, 84.84, 85.00, 85.90, 86.58, 86.98, 88.00, 87.87];
  const low    = [81.29, 80.64, 81.31, 82.65, 83.07, 83.11, 82.49, 82.30, 84.15, 84.11, 84.03, 85.39, 85.76, 87.17, 87.01];
  const volume = [5653100, 6447400, 7690900, 3831400, 4455100, 3798000, 3936200, 4732000, 4841300, 3915300, 6830800, 6694100, 5293600, 7985800, 4807900];
  const options = [2.0, 5.0];

  const info = ti.kvo.info;
  console.log(`=== ${info.name.toUpperCase()} (${info.fullName}) ===`);
  console.log(`Type: ${info.indicatorType}`);
  console.log(`Inputs: ${info.inputs.join(', ')}`);
  console.log(`Options: ${info.options.length > 0 ? info.options.join(', ') : 'none'} (current: ${JSON.stringify(options)})`);
  console.log(`Outputs: ${info.outputs.join(', ')}`);
  if (info.optionalOutputs && info.optionalOutputs.length > 0) {
    console.log(`Optional Outputs: ${info.optionalOutputs.join(', ')}`);
  }
  console.log(`Minimum data required: ${ti.kvo.minData(options)}`);
  console.log(`Minimum data for accuracy (6 decimals): ${ti.kvo.minDataAccuracy(options, 6)}`);
  console.log();

  const [outputs] = ti.kvo.indicator([high, low, close, volume], options);
  console.log(`Full KVO Line: ${outputs[0]}`);

  const n = high.length - 5;
  const [outputs2, state2] = ti.kvo.indicator(
    [high.slice(0, n), low.slice(0, n), close.slice(0, n), volume.slice(0, n)],
    options
  );
  console.log(`\nPartial KVO Line: ${outputs2[0]}`);
  console.log('\nDemonstrating state continuation...');
  console.log('State info: KVO State - internal state for Klinger Volume Oscillator');
  const finalOutputs = state2.batchIndicator([high.slice(n), low.slice(n), close.slice(n), volume.slice(n)]);
  console.log(`Final KVO Line: ${finalOutputs[0]}`);
  console.log(`\nData split: ${n} + ${high.length - n} = ${high.length} total elements`);

  console.log('\n' + '='.repeat(60));
  console.log('SIMD BY ASSETS DEMONSTRATION');
  console.log('='.repeat(60));
  const simdInputs = [
    [[...high], [...low], [...close], [...volume]],
    [high.map(v => v * 1.2), low.map(v => v * 1.2), close.map(v => v * 1.2), volume.map(v => v * 1.2)],
    [high.map((v, i) => 90 + i * 0.5 + v * 0.1), low.map((v, i) => 90 + i * 0.5 + v * 0.1), close.map((v, i) => 90 + i * 0.5 + v * 0.1), volume.map((v, i) => 90 + i * 0.5 + v * 0.1)],
    [high.map((v, i) => 100 - i * 0.3 + v * 0.05), low.map((v, i) => 100 - i * 0.3 + v * 0.05), close.map((v, i) => 100 - i * 0.3 + v * 0.05), volume.map((v, i) => 100 - i * 0.3 + v * 0.05)],
  ];
  console.log(`Processing ${simdInputs.length} assets simultaneously using SIMD...`);
  console.log('Asset 1: Original data\nAsset 2: Scaled up (+20% values)\nAsset 3: Different upward trend\nAsset 4: Downward trend\n');
  try {
    const [simdOutputs] = ti.kvo.simdByAssets(simdInputs, options);
    simdOutputs.forEach((output, i) => console.log(`Asset ${i + 1} KVO values: ${output[0]}`));
    console.log('\nVerification - calculating each asset individually:');
    simdInputs.forEach((inp, i) => {
      const [o] = ti.kvo.indicator(inp, options);
      console.log(`Asset ${i + 1} individual: ${o[0]}`);
    });
    console.log('\nSIMD by Assets demonstration completed successfully!');
  } catch (e) { console.log(`SIMD by Assets error: ${e}`); }

  console.log('\n' + '='.repeat(60));
  console.log('SIMD BY OPTIONS DEMONSTRATION');
  console.log('='.repeat(60));
  const expandedHigh   = Array(20).fill(high).flat();
  const expandedLow    = Array(20).fill(low).flat();
  const expandedClose  = Array(20).fill(close).flat();
  const expandedVolume = Array(20).fill(volume).flat();
  const simdOptions = [[1, 3], [2.0, 5.0], [3, 7], [4.0, 10.0]];
  console.log(`Processing ${simdOptions.length} option sets simultaneously using SIMD...`);
  simdOptions.forEach((opt, i) => console.log(`Option set ${i + 1}: ${JSON.stringify(opt)}`));
  console.log();
  try {
    const [simdOptOutputs] = ti.kvo.simdByOptions([expandedHigh, expandedLow, expandedClose, expandedVolume], simdOptions);
    simdOptOutputs.forEach((output, i) => console.log(`Option set ${i + 1} KVO values (first 5): ${output[0].slice(0, 5)}`));
    console.log('\nVerification - calculating each option set individually:');
    simdOptions.forEach((opt, i) => {
      const [o] = ti.kvo.indicator([expandedHigh, expandedLow, expandedClose, expandedVolume], opt);
      console.log(`Option set ${i + 1} individual (first 5): ${o[0].slice(0, 5)}`);
    });
    console.log('\nSIMD by Options demonstration completed successfully!');
  } catch (e) { console.log(`SIMD by Options error: ${e}`); }

  // ── Optional Outputs ─────────────────────────────────────────────────────
  console.log('\n' + '='.repeat(60));
  console.log('OPTIONAL OUTPUTS');
  console.log('='.repeat(60));
  // Available: 'short_ema', 'long_ema'
  const _nBase = ti.kvo.info.outputs.length;
  const _optNames = ti.kvo.info.optionalOutputs;
  console.log(`Optional outputs: ${_optNames.join(', ')}`);
  console.log();

  // Enable all optional outputs
  const [_allOut] = ti.kvo.indicator([high, low, close, volume], options, _optNames.map(() => true));
  console.log('All optional outputs enabled:');
  _optNames.forEach((n, i) => {
    console.log(`  ${n}: ${_allOut[_nBase + i]}`);
  });

  // Enable only the first optional output
  const [_firstOut] = ti.kvo.indicator([high, low, close, volume], options, _optNames.map((_, i) => i === 0));
  console.log(`\nOnly '${_optNames[0]}' enabled:`);
  console.log(`  ${_optNames[0]}: ${_firstOut[_nBase]}`);
  console.log(`  long_ema: [] (not requested)`);
}

main();
