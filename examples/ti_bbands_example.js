/**
 * Node.js example for the BBANDS indicator from tulip-rs-node.
 * BBANDS returns three outputs: Lower Band, Middle Band, Upper Band.
 */
import * as ti from '../index.js';

function main() {
  const close = Float64Array.from([
    81.59, 81.06, 82.87, 83.00, 83.61,
    83.15, 82.84, 83.99, 84.55, 84.36,
    85.53, 86.54, 86.89, 87.77, 87.29,
  ]);
  const options = [5.0, 2.0];

  const info = ti.bbands.info;
  console.log(`=== ${info.name.toUpperCase()} (${info.fullName}) ===`);
  console.log(`Type: ${info.indicatorType}`);
  console.log(`Inputs: ${info.inputs.join(', ')}`);
  console.log(`Options: ${info.options.join(', ')} (current: ${JSON.stringify(options)})`);
  console.log(`Outputs: ${info.outputs.join(', ')}`);
  if (info.optionalOutputs && info.optionalOutputs.length > 0) {
    console.log(`Optional Outputs: ${info.optionalOutputs.join(', ')}`);
  }
  console.log(`Minimum data required: ${ti.bbands.minData(options)}`);
  console.log();

  const [outputs] = ti.bbands.indicator([close], options);
  console.log('Full dataset calculation:');
  console.log(`Lower Band: ${outputs[0]}`);
  console.log(`Middle Band: ${outputs[1]}`);
  console.log(`Upper Band: ${outputs[2]}`);

  const partialClose = close.slice(0, -5);
  const [outputs2, state2] = ti.bbands.indicator([partialClose], options);
  console.log(`\nPartial calculation (first ${partialClose.length} elements):`);
  console.log(`Lower Band: ${outputs2[0]}`);
  console.log(`Middle Band: ${outputs2[1]}`);
  console.log(`Upper Band: ${outputs2[2]}`);

  console.log('\nDemonstrating state continuation...');
  console.log('State info: BBANDS State - internal state for Bollinger Bands');
  const newClose = close.slice(-5);
  const finalOutputs = state2.batchIndicator([newClose]);
  console.log('Continued calculation:');
  console.log(`New Lower Band: ${finalOutputs[0]}`);
  console.log(`New Middle Band: ${finalOutputs[1]}`);
  console.log(`New Upper Band: ${finalOutputs[2]}`);
  console.log(`\nData split: ${partialClose.length} + ${newClose.length} = ${close.length} total elements`);

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
    const [simdOutputs] = ti.bbands.simdByAssets(simdInputs, options);
    simdOutputs.forEach((output, i) => console.log(`Asset ${i + 1} Lower: ${output[0]}, Middle: ${output[1]}, Upper: ${output[2]}`));
    console.log('\nVerification - calculating each asset individually:');
    simdInputs.forEach((inp, i) => {
      const [o] = ti.bbands.indicator(inp, options);
      console.log(`Asset ${i + 1} Lower: ${o[0]}, Middle: ${o[1]}, Upper: ${o[2]}`);
    });
    console.log('\nSIMD by Assets demonstration completed successfully!');
  } catch (e) { console.log(`SIMD by Assets error: ${e}`); }

  console.log('\n' + '='.repeat(60));
  console.log('SIMD BY OPTIONS DEMONSTRATION');
  console.log('='.repeat(60));
  const expandedClose = new Float64Array(Array.from({length:20}).flatMap(()=>Array.from(close)));
  const simdOptions = [[3, 1], [5.0, 2.0], [7, 3], [10.0, 4.0]];
  simdOptions.forEach((opt, i) => console.log(`Option set ${i + 1}: ${JSON.stringify(opt)}`));
  console.log();
  try {
    const [simdOptOutputs] = ti.bbands.simdByOptions([expandedClose], simdOptions);
    simdOptOutputs.forEach((output, i) => console.log(`Option set ${i + 1} Lower (first 5): ${output[0].slice(0, 5)}`));
    console.log('\nVerification - calculating each option set individually:');
    simdOptions.forEach((opt, i) => {
      const [o] = ti.bbands.indicator([expandedClose], opt);
      console.log(`Option set ${i + 1} Lower (first 5): ${o[0].slice(0, 5)}`);
    });
    console.log('\nSIMD by Options demonstration completed successfully!');
  } catch (e) { console.log(`SIMD by Options error: ${e}`); }
}

main();
