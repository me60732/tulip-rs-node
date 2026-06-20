/**
 * Node.js example for the MSW indicator from tulip-rs-node.
 * MSW returns two outputs: Sine and Lead.
 */
import * as ti from '../index.js';

function main() {
  const close = Float64Array.from([
    81.59, 81.06, 82.87, 83.00, 83.61,
    83.15, 82.84, 83.99, 84.55, 84.36,
    85.53, 86.54, 86.89, 87.77, 87.29,
  ]);
  const options = [5.0];

  const info = ti.msw.info;
  console.log(`=== ${info.name.toUpperCase()} (${info.fullName}) ===`);
  console.log(`Type: ${info.indicatorType}`);
  console.log(`Inputs: ${info.inputs.join(', ')}`);
  console.log(`Options: ${info.options.join(', ')} (current: ${JSON.stringify(options)})`);
  console.log(`Outputs: ${info.outputs.join(', ')}`);
  if (info.optionalOutputs && info.optionalOutputs.length > 0) {
    console.log(`Optional Outputs: ${info.optionalOutputs.join(', ')}`);
  }
  console.log(`Minimum data required: ${ti.msw.minData(options)}`);
  console.log();

  const [outputs] = ti.msw.indicator([close], options);
  console.log(`Full MSW Sine: ${outputs[0]}`);
  console.log(`Full MSW Lead: ${outputs[1]}`);

  const partialClose = close.slice(0, -5);
  const [outputs2, state2] = ti.msw.indicator([partialClose], options);
  console.log(`\nPartial MSW Sine: ${outputs2[0]}`);
  console.log(`Partial MSW Lead: ${outputs2[1]}`);

  console.log('\nDemonstrating state continuation...');
  console.log('State info: MSW State - internal state for Mesa Sine Wave');
  const newClose = close.slice(-5);
  const finalOutputs = state2.batchIndicator([newClose]);
  console.log(`Final MSW Sine: ${finalOutputs[0]}`);
  console.log(`Final MSW Lead: ${finalOutputs[1]}`);
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
    const [simdOutputs] = ti.msw.simdByAssets(simdInputs, options);
    simdOutputs.forEach((output, i) => console.log(`Asset ${i + 1} MSW Sine: ${output[0]}, Lead: ${output[1]}`));
    console.log('\nVerification - calculating each asset individually:');
    simdInputs.forEach((inp, i) => {
      const [o] = ti.msw.indicator(inp, options);
      console.log(`Asset ${i + 1} individual Sine: ${o[0]}, Lead: ${o[1]}`);
    });
    console.log('\nSIMD by Assets demonstration completed successfully!');
  } catch (e) { console.log(`SIMD by Assets error: ${e}`); }

  console.log('\n' + '='.repeat(60));
  console.log('SIMD BY OPTIONS DEMONSTRATION');
  console.log('='.repeat(60));
  const expandedClose = new Float64Array(Array.from({length:20}).flatMap(()=>Array.from(close)));
  const simdOptions = [[2], [5.0], [8], [10.0]];
  simdOptions.forEach((opt, i) => console.log(`Option set ${i + 1}: ${JSON.stringify(opt)}`));
  console.log();
  try {
    const [simdOptOutputs] = ti.msw.simdByOptions([expandedClose], simdOptions);
    simdOptOutputs.forEach((output, i) => console.log(`Option set ${i + 1} MSW Sine (first 5): ${output[0].slice(0, 5)}`));
    console.log('\nVerification - calculating each option set individually:');
    simdOptions.forEach((opt, i) => {
      const [o] = ti.msw.indicator([expandedClose], opt);
      console.log(`Option set ${i + 1} individual Sine (first 5): ${o[0].slice(0, 5)}`);
    });
    console.log('\nSIMD by Options demonstration completed successfully!');
  } catch (e) { console.log(`SIMD by Options error: ${e}`); }
}

main();
