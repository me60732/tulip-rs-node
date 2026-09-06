use napi::bindgen_prelude::*;
use napi::{Env, JsObject};
use napi_derive::napi;

use tulip_rs::indicators::tr::{Indicator, IndicatorState, TIndicatorState, Tr, INPUTS};

use crate::utils::{
    info_to_object, inputs_to_array, js_pair, map_error, vecs_to_float64arrays, InfoObject,
};

// ── State class ──────────────────────────────────────────────────────────────

#[napi]
pub struct TrState {
    pub(crate) inner: IndicatorState,
}

#[napi]
impl TrState {
    /// Continue streaming: feed new bars into an existing state.
    #[napi]
    pub fn batch_indicator(
        &mut self,
        inputs: Vec<Float64Array>,
        optional_outputs: Option<Vec<bool>>,
    ) -> Result<Vec<Float64Array>> {
        let input_arr = inputs_to_array::<INPUTS>(&inputs)?;
        let outputs = self
            .inner
            .batch_indicator(&input_arr, optional_outputs.as_deref())
            .map_err(map_error)?;
        Ok(vecs_to_float64arrays(outputs))
    }

    /// Serialize state to a compact binary `Buffer` (bincode).
    #[napi]
    pub fn to_buffer(&self) -> Result<Buffer> {
        bincode::serialize(&self.inner)
            .map(Buffer::from)
            .map_err(|e| Error::new(Status::GenericFailure, e.to_string()))
    }

    /// Restore state from a `Buffer` produced by `toBuffer()`.
    #[napi(factory)]
    pub fn from_buffer(buf: Buffer) -> Result<Self> {
        bincode::deserialize::<IndicatorState>(buf.as_ref())
            .map(|inner| Self { inner })
            .map_err(|e| Error::new(Status::InvalidArg, e.to_string()))
    }

    /// Serialize state to a JSON string (human-readable, Python-interop).
    #[napi]
    pub fn to_json(&self) -> Result<String> {
        serde_json::to_string(&self.inner)
            .map_err(|e| Error::new(Status::GenericFailure, e.to_string()))
    }

    /// Restore state from a JSON string produced by `toJson()`.
    #[napi(factory)]
    pub fn from_json(json: String) -> Result<Self> {
        serde_json::from_str::<IndicatorState>(&json)
            .map(|inner| Self { inner })
            .map_err(|e| Error::new(Status::InvalidArg, e.to_string()))
    }
}

// ── Top-level functions ───────────────────────────────────────────────────────

/// Run the TR (True Range) indicator. Returns `[outputs, state]` as a JS array.
/// `inputs`: `[[high, low, close]]`
#[napi]
pub fn tr_indicator(
    env: Env,
    inputs: Vec<Float64Array>,
    _options: Vec<f64>,
    optional_outputs: Option<Vec<bool>>,
) -> Result<JsObject> {
    let input_arr = inputs_to_array::<INPUTS>(&inputs)?;

    let _option_arr: [f64; 0] = []
        .try_into()
        .map_err(|_| Error::new(Status::InvalidArg, format!("Expected 0 options")))?;

    let (outputs, inner) =
        Tr::indicator(&input_arr, &[], optional_outputs.as_deref()).map_err(map_error)?;
    js_pair(&env, vecs_to_float64arrays(outputs), TrState { inner })
}

/// Static metadata for TR.
#[napi]
pub fn tr_info() -> InfoObject {
    info_to_object(Tr::INFO)
}

/// Minimum number of input bars needed to produce at least one output bar.
#[napi]
pub fn tr_min_data(_options: Vec<f64>) -> u32 {
    Tr::min_data(&[]) as u32
}

// ── SIMD — by assets ─────────────────────────────────────────────────────────

/// Run N assets through TR in a single SIMD pass (N = 2 | 4 | 8 | 16).
/// Returns `[outputs, states]` — both JS arrays of length N.
/// `inputs` shape: `[N][3][data_len]`
#[napi]
pub fn tr_simd_by_assets(
    env: Env,
    inputs: Vec<Vec<Float64Array>>,
    _options: Vec<f64>,
    optional_outputs: Option<Vec<bool>>,
) -> Result<JsObject> {
    let n = inputs.len();
    if !matches!(n, 2 | 4 | 8 | 16) {
        return Err(Error::new(
            Status::InvalidArg,
            format!("SIMD lane count must be 2, 4, 8, or 16; got {n}"),
        ));
    }

    let asset_vecs: Vec<Vec<&[f64]>> = inputs
        .iter()
        .map(|asset| asset.iter().map(|v| v.as_ref()).collect())
        .collect();

    let input_arrays: Vec<[&[f64]; INPUTS]> = asset_vecs
        .iter()
        .map(|a| {
            a.as_slice().try_into().map_err(|_| {
                Error::new(
                    Status::InvalidArg,
                    format!("Each asset must have {INPUTS} input series"),
                )
            })
        })
        .collect::<Result<_>>()?;

    let input_refs: Vec<&[&[f64]; INPUTS]> = input_arrays.iter().collect();

    let (outs, states_inner) = match n {
        2 => Tr::indicator_by_assets::<2>(
            input_refs.as_slice().try_into().unwrap(),
            &[],
            optional_outputs.as_deref(),
        )
        .map_err(map_error)?,
        4 => Tr::indicator_by_assets::<4>(
            input_refs.as_slice().try_into().unwrap(),
            &[],
            optional_outputs.as_deref(),
        )
        .map_err(map_error)?,
        8 => Tr::indicator_by_assets::<8>(
            input_refs.as_slice().try_into().unwrap(),
            &[],
            optional_outputs.as_deref(),
        )
        .map_err(map_error)?,
        16 => Tr::indicator_by_assets::<16>(
            input_refs.as_slice().try_into().unwrap(),
            &[],
            optional_outputs.as_deref(),
        )
        .map_err(map_error)?,
        _ => unreachable!(),
    };

    let states: Vec<TrState> = states_inner
        .into_iter()
        .map(|inner| TrState { inner })
        .collect();
    let js_outs: Vec<Vec<Float64Array>> = outs.into_iter().map(vecs_to_float64arrays).collect();
    js_pair(&env, js_outs, states)
}
