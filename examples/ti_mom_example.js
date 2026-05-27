/**
 * Node.js example for the MOM indicator from tulip-rs-node.
 *
 * This example demonstrates:
 * 1. Basic MOM calculation
 * 2. Indicator info display
 * 3. State continuation with new data
 * 4. SIMD by assets (4 assets simultaneously)
 * 5. SIMD by options (4 option sets simultaneously)
 */
import * as ti from '../index.js';

function main() {
  const close = [
    81.59, 81.06, 82.87, 83.00, 83.61,
    83.15, 82.84, 83.99, 84.55, 84.36,
    85.53, 86.54, 86.89, 87.77, 87.29,
  ];
  const options = [5.0];

  /////////////////////////////////////////////////// Show Indicator Info First
  const info = ti.mom.info;
  console.log(`=== ${info.name.toUpperCase()} (${info.fullName}) ===`);
  console.log(`Type: ${info.indicatorType}`);
  console.log(`Inputs: ${info.inputs.join(', ')}`);
  console.log(`Options: ${info.options.join(', ')} (current: ${JSON.stringify(options)})`);
  console.log(`Outputs: ${info.outputs.join(', ')}`);
  if (info.optionalOutputs && info.optionalOutputs.length > 0) {
    console.log(`Optional Outputs: ${info.optionalOutputs.join(', ')}`);
  }

  const minData = ti.mom.minData(options);
  console.log(`Minimum data required: ${minData}`);
  const minDataAccuracy = ti.mom.minDataAccuracy(options, 6);
  console.log(`Minimum data for accuracy (6 decimals): ${minDataAccuracy}`);
  console.log();

  /////////////////////////////////////////////////// Full Calculation
  const [outputs] = ti.mom.indicator([close], options);
  console.log(`Full Momentum Line: ${outputs[0]}`);

  /////////////////////////////////////////////////// Partial Calculation + State
  const partialClose = close.slice(0, -5);
  const [outputs2, state2] = ti.mom.indicator([partialClose], options);
  console.log(`\nPartial Momentum Line: ${outputs2[0]}`);

  console.log('\nDemonstrating state continuation...');
  console.log('State info: MOM State - internal state for Momentum');

  const newClose = close.slice(-5);
  const finalOutputs = state2.batchIndicator([newClose]);
  console.log(`Final Momentum Line: ${finalOutputs[0]}`);
  console.log(`\nData split: ${partialClose.length} + ${newClose.length} = ${close.length} total elements`);

  /////////////////////////////////////////////////// SIMD by Assets
  console.log('\n' + '='.repeat(60));
  console.log('SIMD BY ASSETS DEMONSTRATION');
  console.log('='.repeat(60));

  const asset1Close = [...close];
  const asset2Close = close.map(v => v * 1.2);
  const asset3Close = close.map((v, i) => 90 + i * 0.5 + v * 0.1);
  const asset4Close = close.map((v, i) => 100 - i * 0.3 + v * 0.05);

  const simdInputs = [
    [asset1Close],
    [asset2Close],
    [asset3Close],
    [asset4Close],
  ];

  console.log(`Processing ${simdInputs.length} assets simultaneously using SIMD...`);
  console.log('Asset 1: Original data');
  console.log('Asset 2: Scaled up (+20% values)');
  console.log('Asset 3: Different upward trend');
  console.log('Asset 4: Downward trend');
  console.log();

  try {
    const [simdOutputs] = ti.mom.simdByAssets(simdInputs, options);
    console.log('SIMD Results:');
    simdOutputs.forEach((output, i) => {
      console.log(`Asset ${i + 1} MOM values: ${output[0]}`);
    });
    console.log('\nVerification - calculating each asset individually:');
    simdInputs.forEach((assetInputs, i) => {
      const [indOutput] = ti.mom.indicator(assetInputs, options);
      console.log(`Asset ${i + 1} individual: ${indOutput[0]}`);
    });
    console.log('\nSIMD by Assets demonstration completed successfully!');
  } catch (e) {
    console.log(`SIMD by Assets error: ${e}`);
  }

  /////////////////////////////////////////////////// SIMD by Options
  console.log('\n' + '='.repeat(60));
  console.log('SIMD BY OPTIONS DEMONSTRATION');
  console.log('='.repeat(60));

  const expandedClose = Array(20).fill(close).flat();
  const simdOptions = [[2], [5.0], [8], [10.0]];

  console.log(`Processing ${simdOptions.length} option sets simultaneously using SIMD...`);
  simdOptions.forEach((opt, i) => {
    console.log(`Option set ${i + 1}: ${JSON.stringify(opt)}`);
  });
  console.log();

  try {
    const [simdOptOutputs] = ti.mom.simdByOptions([expandedClose], simdOptions);
    console.log('SIMD Results:');
    simdOptOutputs.forEach((output, i) => {
      console.log(`Option set ${i + 1} MOM values (first 5): ${output[0].slice(0, 5)}`);
    });
    console.log('\nVerification - calculating each option set individually:');
    simdOptions.forEach((opt, i) => {
      const [indOutput] = ti.mom.indicator([expandedClose], opt);
      console.log(`Option set ${i + 1} individual (first 5): ${indOutput[0].slice(0, 5)}`);
    });
    console.log('\nSIMD by Options demonstration completed successfully!');
  } catch (e) {
    console.log(`SIMD by Options error: ${e}`);
  }
}

main();
