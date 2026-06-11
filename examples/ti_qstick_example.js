/**
 * Node.js example for the QSTICK indicator from tulip-rs-node.
 * Qstick uses Open, Close inputs with a period option.
 */
import * as ti from '../index.js';

function main() {
  const open  = Float64Array.from([81.85, 81.20, 81.55, 82.91, 83.10, 83.41, 82.71, 82.70, 84.20, 84.25, 84.03, 85.45, 86.18, 88.00, 87.60]);
  const close = Float64Array.from([81.59, 81.06, 82.87, 83.00, 83.61, 83.15, 82.84, 83.99, 84.55, 84.36, 85.53, 86.54, 86.89, 87.77, 87.29]);
  const options = [5.0];

  const info = ti.qstick.info;
  console.log(`=== ${info.name.toUpperCase()} (${info.fullName}) ===`);
  console.log(`Type: ${info.indicatorType}`);
  console.log(`Inputs: ${info.inputs.join(', ')}`);
  console.log(`Options: ${info.options.length > 0 ? info.options.join(', ') : 'none'} (current: ${JSON.stringify(options)})`);
  console.log(`Outputs: ${info.outputs.join(', ')}`);
  if (info.optionalOutputs && info.optionalOutputs.length > 0) {
    console.log(`Optional Outputs: ${info.optionalOutputs.join(', ')}`);
  }
  console.log(`Minimum data required: ${ti.qstick.minData(options)}`);
  console.log(`Minimum data for accuracy (6 decimals): ${ti.qstick.minDataAccuracy(options, 6)}`);
  console.log();

  const [outputs] = ti.qstick.indicator([open, close], options);
  console.log(`Full Qstick Line: ${outputs[0]}`);

  const n = open.length - 5;
  const [outputs2, state2] = ti.qstick.indicator(
    [open.slice(0, n), close.slice(0, n)],
    options
  );
  console.log(`\nPartial Qstick Line: ${outputs2[0]}`);
  console.log('\nDemonstrating state continuation...');
  console.log('State info: QSTICK State - internal state for Qstick');
  const finalOutputs = state2.batchIndicator([open.slice(n), close.slice(n)]);
  console.log(`Final Qstick Line: ${finalOutputs[0]}`);
  console.log(`\nData split: ${n} + ${open.length - n} = ${open.length} total elements`);

  console.log('\n' + '='.repeat(60));
  console.log('SIMD BY ASSETS DEMONSTRATION');
  console.log('='.repeat(60));
  const simdInputs = [
    [open.slice(), close.slice()],
    [open.map(v => v * 1.2), close.map(v => v * 1.2)],
    [open.map((v, i) => 90 + i * 0.5 + v * 0.1), close.map((v, i) => 90 + i * 0.5 + v * 0.1)],
    [open.map((v, i) => 100 - i * 0.3 + v * 0.05), close.map((v, i) => 100 - i * 0.3 + v * 0.05)],
  ];
  console.log(`Processing ${simdInputs.length} assets simultaneously using SIMD...`);
  console.log('Asset 1: Original data\nAsset 2: Scaled up (+20% values)\nAsset 3: Different upward trend\nAsset 4: Downward trend\n');
  try {
    const [simdOutputs] = ti.qstick.simdByAssets(simdInputs, options);
    simdOutputs.forEach((output, i) => console.log(`Asset ${i + 1} Qstick values: ${output[0]}`));
    console.log('\nVerification - calculating each asset individually:');
    simdInputs.forEach((inp, i) => {
      const [o] = ti.qstick.indicator(inp, options);
      console.log(`Asset ${i + 1} individual: ${o[0]}`);
    });
    console.log('\nSIMD by Assets demonstration completed successfully!');
  } catch (e) { console.log(`SIMD by Assets error: ${e}`); }

  console.log('\n' + '='.repeat(60));
  console.log('SIMD BY OPTIONS DEMONSTRATION');
  console.log('='.repeat(60));
  const expandedOpen  = new Float64Array(Array.from({length:20}).flatMap(()=>Array.from(open)));
  const expandedClose = new Float64Array(Array.from({length:20}).flatMap(()=>Array.from(close)));
  const simdOptions = [[2], [5.0], [8], [10.0]];
  console.log(`Processing ${simdOptions.length} option sets simultaneously using SIMD...`);
  simdOptions.forEach((opt, i) => console.log(`Option set ${i + 1}: ${JSON.stringify(opt)}`));
  console.log();
  try {
    const [simdOptOutputs] = ti.qstick.simdByOptions([expandedOpen, expandedClose], simdOptions);
    simdOptOutputs.forEach((output, i) => console.log(`Option set ${i + 1} Qstick values (first 5): ${output[0].slice(0, 5)}`));
    console.log('\nVerification - calculating each option set individually:');
    simdOptions.forEach((opt, i) => {
      const [o] = ti.qstick.indicator([expandedOpen, expandedClose], opt);
      console.log(`Option set ${i + 1} individual (first 5): ${o[0].slice(0, 5)}`);
    });
    console.log('\nSIMD by Options demonstration completed successfully!');
  } catch (e) { console.log(`SIMD by Options error: ${e}`); }
}

main();
