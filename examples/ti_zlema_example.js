/**
 * Node.js example for the ZLEMA indicator from tulip-rs-node.
 * ZLEMA returns one output: ZLEMA Line.
 */
import * as ti from '../index.js';

function main() {
  const close = [
    81.59, 81.06, 82.87, 83.00, 83.61,
    83.15, 82.84, 83.99, 84.55, 84.36,
    85.53, 86.54, 86.89, 87.77, 87.29,
  ];
  const options = [5.0];

  const info = ti.zlema.info;
  console.log(`=== ${info.name.toUpperCase()} (${info.fullName}) ===`);
  console.log(`Type: ${info.indicatorType}`);
  console.log(`Inputs: ${info.inputs.join(', ')}`);
  console.log(`Options: ${info.options.join(', ')} (current: ${JSON.stringify(options)})`);
  console.log(`Outputs: ${info.outputs.join(', ')}`);
  if (info.optionalOutputs && info.optionalOutputs.length > 0) {
    console.log(`Optional Outputs: ${info.optionalOutputs.join(', ')}`);
  }
  console.log(`Minimum data required: ${ti.zlema.minData(options)}`);
  console.log(`Minimum data for accuracy (6 decimals): ${ti.zlema.minDataAccuracy(options, 6)}`);
  console.log();

  const [outputs] = ti.zlema.indicator([close], options);
  console.log(`Full ZLEMA Line: ${outputs[0]}`);

  const partialClose = close.slice(0, -5);
  const [outputs2, state2] = ti.zlema.indicator([partialClose], options);
  console.log(`\nPartial ZLEMA Line: ${outputs2[0]}`);
  console.log('\nDemonstrating state continuation...');
  console.log('State info: ZLEMA State - internal state for Zero-Lag Exponential Moving Average');
  const newClose = close.slice(-5);
  const finalOutputs = state2.batchIndicator([newClose]);
  console.log(`Final ZLEMA Line: ${finalOutputs[0]}`);
  console.log(`\nData split: ${partialClose.length} + ${newClose.length} = ${close.length} total elements`);

  console.log('\n' + '='.repeat(60));
  console.log('SIMD BY ASSETS DEMONSTRATION');
  console.log('='.repeat(60));
  const simdInputs = [
    [[...close]],
    [close.map(v => v * 1.2)],
    [close.map((v, i) => 90 + i * 0.5 + v * 0.1)],
    [close.map((v, i) => 100 - i * 0.3 + v * 0.05)],
  ];
  console.log(`Processing ${simdInputs.length} assets simultaneously using SIMD...`);
  console.log('Asset 1: Original data\nAsset 2: Scaled up (+20% values)\nAsset 3: Different upward trend\nAsset 4: Downward trend\n');
  try {
    const [simdOutputs] = ti.zlema.simdByAssets(simdInputs, options);
    simdOutputs.forEach((output, i) => console.log(`Asset ${i + 1} ZLEMA values: ${output[0]}`));
    console.log('\nVerification - calculating each asset individually:');
    simdInputs.forEach((inp, i) => {
      const [o] = ti.zlema.indicator(inp, options);
      console.log(`Asset ${i + 1} individual: ${o[0]}`);
    });
    console.log('\nSIMD by Assets demonstration completed successfully!');
  } catch (e) { console.log(`SIMD by Assets error: ${e}`); }

  console.log('\n' + '='.repeat(60));
  console.log('SIMD BY OPTIONS DEMONSTRATION');
  console.log('='.repeat(60));
  const expandedClose = Array(20).fill(close).flat();
  const simdOptions = [[2], [5.0], [8], [10.0]];
  simdOptions.forEach((opt, i) => console.log(`Option set ${i + 1}: ${JSON.stringify(opt)}`));
  console.log();
  try {
    const [simdOptOutputs] = ti.zlema.simdByOptions([expandedClose], simdOptions);
    simdOptOutputs.forEach((output, i) => console.log(`Option set ${i + 1} ZLEMA values (first 5): ${output[0].slice(0, 5)}`));
    console.log('\nVerification - calculating each option set individually:');
    simdOptions.forEach((opt, i) => {
      const [o] = ti.zlema.indicator([expandedClose], opt);
      console.log(`Option set ${i + 1} individual (first 5): ${o[0].slice(0, 5)}`);
    });
    console.log('\nSIMD by Options demonstration completed successfully!');
  } catch (e) { console.log(`SIMD by Options error: ${e}`); }
}

main();
