/**
 * Node.js example for the Median Price indicator from tulip-rs-node.
 * Median Price returns one output: Median Price Line.
 * This indicator takes no options.
 */
import * as ti from '../index.js';

function main() {
  const high = Float64Array.from([82.15, 81.89, 83.03, 83.30, 83.85, 83.90, 83.33, 84.30, 84.84, 85.00, 85.90, 86.58, 86.98, 88.00, 87.87]);
  const low  = Float64Array.from([81.29, 80.64, 81.31, 82.65, 83.07, 83.11, 82.49, 82.30, 84.15, 84.11, 84.03, 85.39, 85.76, 87.17, 87.01]);
  const options = [];

  const info = ti.medprice.info;
  console.log(`=== ${info.name.toUpperCase()} (${info.fullName}) ===`);
  console.log(`Type: ${info.indicatorType}`);
  console.log(`Inputs: ${info.inputs.join(', ')}`);
  console.log(`Options: ${info.options.length > 0 ? info.options.join(', ') : '(none)'} (current: ${JSON.stringify(options)})`);
  console.log(`Outputs: ${info.outputs.join(', ')}`);
  if (info.optionalOutputs && info.optionalOutputs.length > 0) {
    console.log(`Optional Outputs: ${info.optionalOutputs.join(', ')}`);
  }
  console.log(`Minimum data required: ${ti.medprice.minData([])}`);
  console.log(`Minimum data for accuracy (6 decimals): ${ti.medprice.minDataAccuracy([], 6)}`);
  console.log();

  const [outputs] = ti.medprice.indicator([high, low], []);
  console.log('Full dataset calculation:');
  console.log(`Full Median Price Line: ${outputs[0]}`);

  const partialHigh = high.slice(0, -5);
  const partialLow  = low.slice(0, -5);
  const [outputs2, state2] = ti.medprice.indicator([partialHigh, partialLow], []);
  console.log(`\nPartial calculation (first ${partialHigh.length} elements):`);
  console.log(`Partial Median Price Line: ${outputs2[0]}`);

  console.log('\nDemonstrating state continuation...');
  console.log('State info: Median Price State - internal state for Median Price');
  const newHigh = high.slice(-5);
  const newLow  = low.slice(-5);
  const finalOutputs = state2.batchIndicator([newHigh, newLow]);
  console.log('Continued calculation:');
  console.log(`Final Median Price Line: ${finalOutputs[0]}`);
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
    const [simdOutputs] = ti.medprice.simdByAssets(simdInputs, []);
    simdOutputs.forEach((output, i) => console.log(`Asset ${i + 1} Median Price Line: ${output[0]}`));
    console.log('\nVerification - calculating each asset individually:');
    simdInputs.forEach((inp, i) => {
      const [o] = ti.medprice.indicator(inp, []);
      console.log(`Asset ${i + 1} individual: ${o[0]}`);
    });
    console.log('\nSIMD by Assets demonstration completed successfully!');
  } catch (e) { console.log(`SIMD by Assets error: ${e}`); }
}

main();
