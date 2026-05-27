/**
 * Node.js example for the PIVOTPOINT indicator from tulip-rs-node.
 *
 * PIVOTPOINT computes the classic floor-trader pivot levels from a lookback
 * window of `period` bars.  It returns a single snapshot array:
 *   outputs[0] = [s3, s2, s1, pp, r1, r2, r3]
 *
 * Inputs:  high, low, close
 * Options: [period]
 * Output:  one array with 7 elements — the pivot levels for the most-recent
 *          complete period.
 */
import * as ti from "../index.js";

function main() {
  const high = [
    82.15, 81.89, 83.03, 83.3, 83.85, 83.9, 83.33, 84.3, 84.84, 85.0, 85.9,
    86.58, 86.98, 88.0, 87.87,
  ];
  const low = [
    81.29, 80.64, 81.31, 82.65, 83.07, 83.11, 82.49, 82.3, 84.15, 84.11, 84.03,
    85.39, 85.76, 87.17, 87.01,
  ];
  const close = [
    81.59, 81.06, 82.87, 83.0, 83.61, 83.15, 82.84, 83.99, 84.55, 84.36, 85.53,
    86.54, 86.89, 87.77, 87.29,
  ];
  const options = [5.0]; // period

  const info = ti.pivotpoint.info;
  console.log(`=== ${info.name.toUpperCase()} (${info.fullName}) ===`);
  console.log(`Type: ${info.indicatorType}`);
  console.log(`Inputs: ${info.inputs.join(", ")}`);
  console.log(
    `Options: ${info.options.length > 0 ? info.options.join(", ") : "none"} (current: ${JSON.stringify(options)})`,
  );
  console.log(`Outputs: ${info.outputs.join(", ")}`);
  console.log(`Minimum data required: ${ti.pivotpoint.minData(options)}`);
  console.log(
    `Minimum data for accuracy (6 decimals): ${ti.pivotpoint.minDataAccuracy(options, 6)}`,
  );
  console.log();

  // outputs[0] is the snapshot array [s3, s2, s1, pp, r1, r2, r3]
  const [outputs] = ti.pivotpoint.indicator([high, low, close], options);
  const full = outputs[0];
  console.log("Full pivot snapshot (most-recent period):");
  console.log(`  Full S3: ${full[0]}`);
  console.log(`  Full S2: ${full[1]}`);
  console.log(`  Full S1: ${full[2]}`);
  console.log(`  Full PP: ${full[3]}`);
  console.log(`  Full R1: ${full[4]}`);
  console.log(`  Full R2: ${full[5]}`);
  console.log(`  Full R3: ${full[6]}`);

  const partialHigh = high.slice(0, -5);
  const partialLow = low.slice(0, -5);
  const partialClose = close.slice(0, -5);
  const [outputs2, state2] = ti.pivotpoint.indicator(
    [partialHigh, partialLow, partialClose],
    options,
  );
  const partial = outputs2[0];
  console.log("\nPartial pivot snapshot (first 10 bars):");
  console.log(`  Partial S3: ${partial[0]}`);
  console.log(`  Partial S2: ${partial[1]}`);
  console.log(`  Partial S1: ${partial[2]}`);
  console.log(`  Partial PP: ${partial[3]}`);
  console.log(`  Partial R1: ${partial[4]}`);
  console.log(`  Partial R2: ${partial[5]}`);
  console.log(`  Partial R3: ${partial[6]}`);

  console.log("\nDemonstrating state continuation...");
  console.log("State info: PIVOTPOINT State - internal state for Pivot Point");
  const newHigh = high.slice(-5);
  const newLow = low.slice(-5);
  const newClose = close.slice(-5);
  const finalOutputs = state2.batchIndicator([newHigh, newLow, newClose]);
  const final = finalOutputs[0];
  console.log("Final pivot snapshot (after continuation — matches full run):");
  console.log(`  Final S3: ${final[0]}`);
  console.log(`  Final S2: ${final[1]}`);
  console.log(`  Final S1: ${final[2]}`);
  console.log(`  Final PP: ${final[3]}`);
  console.log(`  Final R1: ${final[4]}`);
  console.log(`  Final R2: ${final[5]}`);
  console.log(`  Final R3: ${final[6]}`);
  console.log(
    `\nData split: ${partialHigh.length} + ${newHigh.length} = ${high.length} total elements`,
  );
}

main();
