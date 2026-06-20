import { createRequire } from "module";

const _require = createRequire(import.meta.url);

export interface DisplayGroup {
  /** Stable machine-readable key, e.g. `"adx_dx"` or `"true_range"`. */
  id: string;
  /** Human-readable pane title, e.g. `"Directional Index"`. */
  label: string;
  /** Where to render: `"Overlay"` | `"Indicator"` | `"Volume"`. */
  displayType: string;
  /** Output names belonging to this group (may include optional outputs). */
  outputs: string[];
}

export interface IndicatorInfo {
  name: string;
  fullName: string;
  inputs: string[];
  options: string[];
  outputs: string[];
  optionalOutputs: string[];
  indicatorType: string;
  /** Groups of outputs that should be rendered together on the same pane. */
  displayGroups: DisplayGroup[];
}

/**
 * Wraps a single tulip_rs indicator's flat napi-rs exports into a typed class.
 *
 * `S` is the napi-rs State class for this indicator (e.g. `SmaState`).
 * It defaults to `unknown` so that the class is usable before `napi build`
 * has been run.
 */
export class Indicator<S = unknown> {
  /** Static metadata — fetched once at construction, never changes. */
  readonly info: IndicatorInfo;

  /** Run the indicator on a batch of data. Returns `[outputs, state]`. */
  readonly indicator: (
    inputs: number[][],
    options: number[],
    optionalOutputs?: boolean[],
  ) => [number[][], S];

  /** Minimum number of input bars required to produce at least one output bar. */
  readonly minData: (options: number[]) => number;

  /** Minimum input bars needed to achieve a given decimal accuracy. */

  /**
   * SIMD — run N assets through the indicator in a single pass.
   * N must be 2, 4, 8, or 16.
   * `inputs` shape: `[N][INPUTS_WIDTH][data_len]`
   */
  readonly simdByAssets: (
    inputs: number[][][],
    options: number[],
    optionalOutputs?: boolean[],
  ) => [number[][][], S[]];

  /**
   * SIMD — run N option-sets against the same asset data in a single pass.
   * N must be 2, 4, 8, or 16.
   * Absent (`undefined`) for indicators that have no options (OPTIONS_WIDTH === 0).
   */
  readonly simdByOptions?: (
    inputs: number[][],
    optionsList: number[][],
    optionalOutputs?: boolean[],
  ) => [number[][][], S[]];

  /**
   * The napi-rs State class for this indicator.
   * Use `ti.sma.State.fromBuffer(buf)` or `ti.sma.State.fromJson(json)` to restore state.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly State: any;

  constructor(name: string) {
    // Load the CJS binding via createRequire — safe to call from ESM.
    const n = _require("../binding.cjs") as Record<string, unknown>;

    const cap = name.charAt(0).toUpperCase() + name.slice(1);

    this.info = (n[`${name}Info`] as () => IndicatorInfo)();
    this.indicator = n[`${name}Indicator`] as this["indicator"];
    this.minData = n[`${name}MinData`] as this["minData"];
    this.simdByAssets = n[`${name}SimdByAssets`] as this["simdByAssets"];
    this.simdByOptions = n[`${name}SimdByOptions`] as
      | this["simdByOptions"]
      | undefined;
    this.State = n[`${cap}State`];
  }
}
