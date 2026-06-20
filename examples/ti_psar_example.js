import * as ti from '../index.js';

function main() {
  const high = Float64Array.from([82.15, 81.89, 83.03, 83.30, 83.85, 83.90, 83.33, 84.30, 84.84, 85.00, 85.90, 86.58, 86.98, 88.00, 87.87]);
  const low  = Float64Array.from([81.29, 80.64, 81.31, 82.65, 83.07, 83.11, 82.49, 82.30, 84.15, 84.11, 84.03, 85.39, 85.76, 87.17, 87.01]);
  const options = [0.02, 0.2];

  const info = ti.psar.info;
  console.log(`=== ${info.name.toUpperCase()} (${info.fullName}) ===`);
  console.log(`Type: ${info.indicatorType}`);
  console.log(`Inputs: ${info.inputs.join(', ')}`);
  console.log(`Options: ${info.options.join(', ')} (current: ${JSON.stringify(options)})`);
  console.log(`Outputs: ${info.outputs.join(', ')}`);
  if (info.optionalOutputs && info.optionalOutputs.length > 0) console.log(`Optional Outputs: ${info.optionalOutputs.join(', ')}`);
  console.log(`Minimum data required: ${ti.psar.minData(options)}`);
  console.log();

  const [outputs] = ti.psar.indicator([high, low], options);
  console.log(`Full PSAR Line: ${outputs[0]}`);

  const partialHigh = high.slice(0, -5);
  const partialLow = low.slice(0, -5);
  const [outputs2, state2] = ti.psar.indicator([partialHigh, partialLow], options);
  console.log(`\nPartial PSAR Line: ${outputs2[0]}`);
  console.log('\nDemonstrating state continuation...');
  console.log('State info: PSAR State - internal state for Parabolic SAR');
  const newHigh = high.slice(-5);
  const newLow = low.slice(-5);
  const finalOutputs = state2.batchIndicator([newHigh, newLow]);
  console.log(`Final PSAR Line: ${finalOutputs[0]}`);
  console.log(`\nData split: ${partialHigh.length} + ${newHigh.length} = ${high.length} total elements`);

  console.log('\n' + '='.repeat(60));
  console.log('SIMD BY ASSETS DEMONSTRATION');
  console.log('='.repeat(60));
  const simdInputs = [
    [high.slice(), low.slice()],
    [high.map(v => v * 1.2), low.map(v => v * 1.2)],
    [high.map((v, i) => 90 + i * 0.5 + v * 0.1), low.map((v, i) => 90 + i * 0.5 + v * 0.1)],
    [high.map((v, i) => 100 - i * 0.3 + v * 0.05), low.map((v, i) => 100 - i * 0.3 + v * 0.05)],
  ];
  console.log(`Processing ${simdInputs.length} assets simultaneously using SIMD...`);
  console.log('Asset 1: Original data\nAsset 2: Scaled up (+20% values)\nAsset 3: Different upward trend\nAsset 4: Downward trend\n');
  try {
    const [simdOutputs] = ti.psar.simdByAssets(simdInputs, options);
    simdOutputs.forEach((output, i) => console.log(`Asset ${i + 1} PSAR values: ${output[0]}`));
    console.log('\nVerification - calculating each asset individually:');
    simdInputs.forEach((inp, i) => {
      const [o] = ti.psar.indicator(inp, options);
      console.log(`Asset ${i + 1} individual: ${o[0]}`);
    });
    console.log('\nSIMD by Assets demonstration completed successfully!');
  } catch (e) { console.log(`SIMD by Assets error: ${e}`); }

  console.log('\n' + '='.repeat(60));
  console.log('SIMD BY OPTIONS DEMONSTRATION');
  console.log('='.repeat(60));
  const expandedHigh = new Float64Array(Array.from({length:20}).flatMap(()=>Array.from(high)));
  const expandedLow = new Float64Array(Array.from({length:20}).flatMap(()=>Array.from(low)));
  const simdOptions = [[0.01, 0.1], [0.02, 0.2], [0.03, 0.3], [0.04, 0.4]];
  simdOptions.forEach((opt, i) => console.log(`Option set ${i + 1}: ${JSON.stringify(opt)}`));
  console.log();
  try {
    const [simdOptOutputs] = ti.psar.simdByOptions([expandedHigh, expandedLow], simdOptions);
    simdOptOutputs.forEach((output, i) => console.log(`Option set ${i + 1} PSAR values (first 5): ${output[0].slice(0, 5)}`));
    console.log('\nVerification - calculating each option set individually:');
    simdOptions.forEach((opt, i) => {
      const [o] = ti.psar.indicator([expandedHigh, expandedLow], opt);
      console.log(`Option set ${i + 1} individual (first 5): ${o[0].slice(0, 5)}`);
    });
    console.log('\nSIMD by Options demonstration completed successfully!');
  } catch (e) { console.log(`SIMD by Options error: ${e}`); }
}

main();
