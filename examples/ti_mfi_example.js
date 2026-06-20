/**
 * Node.js example for the MFI indicator from tulip-rs-node.
 * Money Flow Index uses High, Low, Close, Volume inputs with a period option.
 */
import * as ti from '../index.js';

function main() {
  const close  = Float64Array.from([81.59, 81.06, 82.87, 83.00, 83.61, 83.15, 82.84, 83.99, 84.55, 84.36, 85.53, 86.54, 86.89, 87.77, 87.29]);
  const high   = Float64Array.from([82.15, 81.89, 83.03, 83.30, 83.85, 83.90, 83.33, 84.30, 84.84, 85.00, 85.90, 86.58, 86.98, 88.00, 87.87]);
  const low    = Float64Array.from([81.29, 80.64, 81.31, 82.65, 83.07, 83.11, 82.49, 82.30, 84.15, 84.11, 84.03, 85.39, 85.76, 87.17, 87.01]);
  const volume = Float64Array.from([5653100, 6447400, 7690900, 3831400, 4455100, 3798000, 3936200, 4732000, 4841300, 3915300, 6830800, 6694100, 5293600, 7985800, 4807900]);
  const options = [5.0];

  const info = ti.mfi.info;
  console.log(`=== ${info.name.toUpperCase()} (${info.fullName}) ===`);
  console.log(`Type: ${info.indicatorType}`);
  console.log(`Inputs: ${info.inputs.join(', ')}`);
  console.log(`Options: ${info.options.length > 0 ? info.options.join(', ') : 'none'} (current: ${JSON.stringify(options)})`);
  console.log(`Outputs: ${info.outputs.join(', ')}`);
  if (info.optionalOutputs && info.optionalOutputs.length > 0) {
    console.log(`Optional Outputs: ${info.optionalOutputs.join(', ')}`);
  }
  console.log(`Minimum data required: ${ti.mfi.minData(options)}`);
  console.log();

  const [outputs] = ti.mfi.indicator([high, low, close, volume], options);
  console.log(`Full MFI Line: ${outputs[0]}`);

  const n = high.length - 5;
  const [outputs2, state2] = ti.mfi.indicator(
    [high.slice(0, n), low.slice(0, n), close.slice(0, n), volume.slice(0, n)],
    options
  );
  console.log(`\nPartial MFI Line: ${outputs2[0]}`);
  console.log('\nDemonstrating state continuation...');
  console.log('State info: MFI State - internal state for Money Flow Index');
  const finalOutputs = state2.batchIndicator([high.slice(n), low.slice(n), close.slice(n), volume.slice(n)]);
  console.log(`Final MFI Line: ${finalOutputs[0]}`);
  console.log(`\nData split: ${n} + ${high.length - n} = ${high.length} total elements`);

  console.log('\n' + '='.repeat(60));
  console.log('SIMD BY ASSETS DEMONSTRATION');
  console.log('='.repeat(60));
  const simdInputs = [
    [high.slice(), low.slice(), close.slice(), volume.slice()],
    [high.map(v => v * 1.2), low.map(v => v * 1.2), close.map(v => v * 1.2), volume.map(v => v * 1.2)],
    [high.map((v, i) => 90 + i * 0.5 + v * 0.1), low.map((v, i) => 90 + i * 0.5 + v * 0.1), close.map((v, i) => 90 + i * 0.5 + v * 0.1), volume.map((v, i) => 90 + i * 0.5 + v * 0.1)],
    [high.map((v, i) => 100 - i * 0.3 + v * 0.05), low.map((v, i) => 100 - i * 0.3 + v * 0.05), close.map((v, i) => 100 - i * 0.3 + v * 0.05), volume.map((v, i) => 100 - i * 0.3 + v * 0.05)],
  ];
  console.log(`Processing ${simdInputs.length} assets simultaneously using SIMD...`);
  console.log('Asset 1: Original data\nAsset 2: Scaled up (+20% values)\nAsset 3: Different upward trend\nAsset 4: Downward trend\n');
  try {
    const [simdOutputs] = ti.mfi.simdByAssets(simdInputs, options);
    simdOutputs.forEach((output, i) => console.log(`Asset ${i + 1} MFI values: ${output[0]}`));
    console.log('\nVerification - calculating each asset individually:');
    simdInputs.forEach((inp, i) => {
      const [o] = ti.mfi.indicator(inp, options);
      console.log(`Asset ${i + 1} individual: ${o[0]}`);
    });
    console.log('\nSIMD by Assets demonstration completed successfully!');
  } catch (e) { console.log(`SIMD by Assets error: ${e}`); }

  console.log('\n' + '='.repeat(60));
  console.log('SIMD BY OPTIONS DEMONSTRATION');
  console.log('='.repeat(60));
  const expandedHigh   = new Float64Array(Array.from({length:20}).flatMap(()=>Array.from(high)));
  const expandedLow    = new Float64Array(Array.from({length:20}).flatMap(()=>Array.from(low)));
  const expandedClose  = new Float64Array(Array.from({length:20}).flatMap(()=>Array.from(close)));
  const expandedVolume = new Float64Array(Array.from({length:20}).flatMap(()=>Array.from(volume)));
  const simdOptions = [[2], [5.0], [8], [10.0]];
  console.log(`Processing ${simdOptions.length} option sets simultaneously using SIMD...`);
  simdOptions.forEach((opt, i) => console.log(`Option set ${i + 1}: ${JSON.stringify(opt)}`));
  console.log();
  try {
    const [simdOptOutputs] = ti.mfi.simdByOptions([expandedHigh, expandedLow, expandedClose, expandedVolume], simdOptions);
    simdOptOutputs.forEach((output, i) => console.log(`Option set ${i + 1} MFI values (first 5): ${output[0].slice(0, 5)}`));
    console.log('\nVerification - calculating each option set individually:');
    simdOptions.forEach((opt, i) => {
      const [o] = ti.mfi.indicator([expandedHigh, expandedLow, expandedClose, expandedVolume], opt);
      console.log(`Option set ${i + 1} individual (first 5): ${o[0].slice(0, 5)}`);
    });
    console.log('\nSIMD by Options demonstration completed successfully!');
  } catch (e) { console.log(`SIMD by Options error: ${e}`); }

  // ── Optional Outputs ─────────────────────────────────────────────────────
  console.log('\n' + '='.repeat(60));
  console.log('OPTIONAL OUTPUTS');
  console.log('='.repeat(60));
  // Available: 'typprice'
  const _nBase = ti.mfi.info.outputs.length;
  const _optNames = ti.mfi.info.optionalOutputs;
  console.log(`Optional outputs: ${_optNames.join(', ')}`);
  console.log();

  // Enable all optional outputs
  const [_allOut] = ti.mfi.indicator([high, low, close, volume], options, _optNames.map(() => true));
  console.log('All optional outputs enabled:');
  _optNames.forEach((n, i) => {
    console.log(`  ${n}: ${_allOut[_nBase + i]}`);
  });

  // Enable only the first optional output
  const [_firstOut] = ti.mfi.indicator([high, low, close, volume], options, _optNames.map((_, i) => i === 0));
  console.log(`\nOnly '${_optNames[0]}' enabled:`);
  console.log(`  ${_optNames[0]}: ${_firstOut[_nBase]}`);
}

main();
