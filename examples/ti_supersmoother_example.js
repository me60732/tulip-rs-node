/**
 * Node.js example for the SuperSmoother indicator from tulip-rs-node.
 * The Super Smoother uses a 2-pole Butterworth filter to eliminate aliasing noise.
 * No optional outputs.
 */
import * as ti from '../index.js';

function main() {
  const close = Float64Array.from([
    81.59, 81.06, 82.87, 83.00, 83.61, 83.15, 82.84, 83.99, 84.55, 84.36,
    85.53, 86.54, 86.89, 87.77, 87.29, 87.50, 88.10, 88.50, 87.90, 88.20,
    88.80, 89.10, 88.70, 89.30, 89.70, 90.10, 89.50, 90.20, 90.80, 91.10,
    90.50, 91.20, 91.80, 92.10, 91.50, 92.20, 92.80, 93.10, 92.50, 93.20,
  ]);
  const options = [10.0];

  const info = ti.supersmoother.info;
  console.log(`=== ${info.name.toUpperCase()} (${info.fullName}) ===`);
  console.log(`Type: ${info.indicatorType}`);
  console.log(`Inputs: ${info.inputs.join(', ')}`);
  console.log(`Options: ${info.options.join(', ')} (current: ${JSON.stringify(options)})`);
  console.log(`Outputs: ${info.outputs.join(', ')}`);
  if (info.optionalOutputs && info.optionalOutputs.length > 0) {
    console.log(`Optional Outputs: ${info.optionalOutputs.join(', ')}`);
  }
  console.log(`Minimum data required: ${ti.supersmoother.minData(options)}`);
  console.log();

  const [outputs] = ti.supersmoother.indicator([close], options);
  console.log(`Full SuperSmoother Value: ${outputs[0]}`);

  const n = close.length - 5;
  const [outputs2, state2] = ti.supersmoother.indicator([close.slice(0, n)], options);
  console.log(`\nPartial SuperSmoother Value: ${outputs2[0]}`);

  console.log('\nDemonstrating state continuation...');
  console.log('State info: SuperSmoother State - internal state for Super Smoother Filter');
  const finalOutputs = state2.batchIndicator([close.slice(n)]);
  console.log(`Final SuperSmoother Value: ${finalOutputs[0]}`);
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
    const [simdOutputs] = ti.supersmoother.simdByAssets(simdInputs, options);
    simdOutputs.forEach((output, i) =>
      console.log(`Asset ${i + 1} SuperSmoother Value: ${output[0]}`));
    console.log('\nVerification - calculating each asset individually:');
    simdInputs.forEach((inp, i) => {
      const [o] = ti.supersmoother.indicator(inp, options);
      console.log(`Asset ${i + 1} individual: ${o[0]}`);
    });
    console.log('\nSIMD by Assets demonstration completed successfully!');
  } catch (e) { console.log(`SIMD by Assets error: ${e}`); }

  console.log('\n' + '='.repeat(60));
  console.log('SIMD BY OPTIONS DEMONSTRATION');
  console.log('='.repeat(60));
  const simdOptions = [[5], [10], [14], [20]];
  simdOptions.forEach((opt, i) => console.log(`Option set ${i + 1}: ${JSON.stringify(opt)}`));
  console.log();
  try {
    const [simdOptOutputs] = ti.supersmoother.simdByOptions([close], simdOptions);
    simdOptOutputs.forEach((output, i) =>
      console.log(`Option set ${i + 1} SuperSmoother (first 5): ${output[0].slice(0, 5)}`));
    console.log('\nVerification - calculating each option set individually:');
    simdOptions.forEach((opt, i) => {
      const [o] = ti.supersmoother.indicator([close], opt);
      console.log(`Option set ${i + 1} individual (first 5): ${o[0].slice(0, 5)}`);
    });
    console.log('\nSIMD by Options demonstration completed successfully!');
  } catch (e) { console.log(`SIMD by Options error: ${e}`); }
}

main();
