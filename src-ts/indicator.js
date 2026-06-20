import { createRequire } from "module";
const _require = createRequire(import.meta.url);
/**
 * Wraps a single tulip_rs indicator's flat napi-rs exports into a typed class.
 *
 * `S` is the napi-rs State class for this indicator (e.g. `SmaState`).
 * It defaults to `unknown` so that the class is usable before `napi build`
 * has been run.
 */
export class Indicator {
    /** Static metadata — fetched once at construction, never changes. */
    info;
    /** Run the indicator on a batch of data. Returns `[outputs, state]`. */
    indicator;
    /** Minimum number of input bars required to produce at least one output bar. */
    minData;
    /** Minimum input bars needed to achieve a given decimal accuracy. */
    /**
     * SIMD — run N assets through the indicator in a single pass.
     * N must be 2, 4, 8, or 16.
     * `inputs` shape: `[N][INPUTS_WIDTH][data_len]`
     */
    simdByAssets;
    /**
     * SIMD — run N option-sets against the same asset data in a single pass.
     * N must be 2, 4, 8, or 16.
     * Absent (`undefined`) for indicators that have no options (OPTIONS_WIDTH === 0).
     */
    simdByOptions;
    /**
     * The napi-rs State class for this indicator.
     * Use `ti.sma.State.fromBuffer(buf)` or `ti.sma.State.fromJson(json)` to restore state.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    State;
    constructor(name) {
        // Load the CJS binding via createRequire — safe to call from ESM.
        const n = _require("../binding.cjs");
        const cap = name.charAt(0).toUpperCase() + name.slice(1);
        this.info = n[`${name}Info`]();
        this.indicator = n[`${name}Indicator`];
        this.minData = n[`${name}MinData`];
        this.simdByAssets = n[`${name}SimdByAssets`];
        this.simdByOptions = n[`${name}SimdByOptions`];
        this.State = n[`${cap}State`];
    }
}
