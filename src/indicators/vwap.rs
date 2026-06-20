use napi::bindgen_prelude::*;
use napi::{Env, JsObject};
use napi_derive::napi;
use tulip_rs::indicator_types::TIndicatorState as _;
use tulip_rs::indicators::vwap as rust_vwap;

use crate::utils::{
    info_to_object, inputs_to_array, js_pair, map_error, vecs_to_float64arrays, InfoObject,
};

const IW: usize = rust_vwap::INPUTS_WIDTH;
const OW: usize = rust_vwap::OPTIONS_WIDTH;

// ── State class ──────────────────────────────────────────────────────────────

#[napi]
pub struct VwapState {
    pub(crate) inner: rust_vwap::IndicatorState,
}

#[napi]
impl VwapState {
    /// Continue streaming: feed new bars into an existing state.
    #[napi]
    pub fn batch_indicator(
        &mut self,
        inputs: Vec<Float64Array>,
        optional_outputs: Option<Vec<bool>>,
    ) -> Result<Vec<Float64Array>> {
        let input_arr = inputs_to_array::<IW>(&inputs)?;
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
        bincode::deserialize::<rust_vwap::IndicatorState>(buf.as_ref())
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
        serde_json::from_str::<rust_vwap::IndicatorState>(&json)
            .map(|inner| Self { inner })
            .map_err(|e| Error::new(Status::InvalidArg, e.to_string()))
    }
}

// ── Top-level functions ───────────────────────────────────────────────────────

/// Run the VWAP indicator. Returns `[outputs, state]` as a JS array.
/// `inputs`: `[[high, low, close, volume]]`   `options`: `[]`
/// Mandatory outputs: `vwap` | Optional: `[want_typprice]`
#[napi]
pub fn vwap_indicator(
    env: Env,
    inputs: Vec<Float64Array>,
    options: Vec<f64>,
    optional_outputs: Option<Vec<bool>>,
) -> Result<JsObject> {
    let input_arr = inputs_to_array::<IW>(&inputs)?;
    let option_arr: [f64; OW] = options
        .try_into()
        .map_err(|_| Error::new(Status::InvalidArg, format!("Expected {OW} options")))?;
    let (outputs, inner) =
        rust_vwap::indicator(&input_arr, &option_arr, optional_outputs.as_deref())
            .map_err(map_error)?;
    js_pair(&env, vecs_to_float64arrays(outputs), VwapState { inner })
}

/// Static metadata for VWAP.
#[napi]
pub fn vwap_info() -> InfoObject {
    info_to_object(rust_vwap::INFO)
}

/// Minimum number of input bars needed to produce at least one output bar.
#[napi]
pub fn vwap_min_data(options: Vec<f64>) -> u32 {
    rust_vwap::min_data(&options) as u32
}


// ── SIMD — by assets ─────────────────────────────────────────────────────────

/// Run N assets through VWAP in a single SIMD pass (N = 2 | 4 | 8 | 16).
/// Returns `[outputs, states]` — both JS arrays of length N.
/// `inputs` shape: `[N][4][data_len]`
#[napi]
pub fn vwap_simd_by_assets(
    env: Env,
    inputs: Vec<Vec<Float64Array>>,
    options: Vec<f64>,
    optional_outputs: Option<Vec<bool>>,
) -> Result<JsObject> {
    let n = inputs.len();
    if !matches!(n, 2 | 4 | 8 | 16) {
        return Err(Error::new(
            Status::InvalidArg,
            format!("SIMD lane count must be 2, 4, 8, or 16; got {n}"),
        ));
    }
    let option_arr: [f64; OW] = options
        .try_into()
        .map_err(|_| Error::new(Status::InvalidArg, format!("Expected {OW} options")))?;
    let asset_vecs: Vec<Vec<&[f64]>> = inputs
        .iter()
        .map(|asset| asset.iter().map(|v| v.as_ref()).collect())
        .collect();
    let input_arrays: Vec<[&[f64]; IW]> = asset_vecs
        .iter()
        .map(|a| {
            a.as_slice().try_into().map_err(|_| {
                Error::new(
                    Status::InvalidArg,
                    format!("Each asset must have {IW} input series"),
                )
            })
        })
        .collect::<Result<_>>()?;
    let input_refs: Vec<&[&[f64]; IW]> = input_arrays.iter().collect();
    let (outs, states_inner) = match n {
        2 => rust_vwap::by_assets::indicator::<2>(
            input_refs.as_slice().try_into().unwrap(),
            &option_arr,
            optional_outputs.as_deref(),
        )
        .map_err(map_error)?,
        4 => rust_vwap::by_assets::indicator::<4>(
            input_refs.as_slice().try_into().unwrap(),
            &option_arr,
            optional_outputs.as_deref(),
        )
        .map_err(map_error)?,
        8 => rust_vwap::by_assets::indicator::<8>(
            input_refs.as_slice().try_into().unwrap(),
            &option_arr,
            optional_outputs.as_deref(),
        )
        .map_err(map_error)?,
        16 => rust_vwap::by_assets::indicator::<16>(
            input_refs.as_slice().try_into().unwrap(),
            &option_arr,
            optional_outputs.as_deref(),
        )
        .map_err(map_error)?,
        _ => unreachable!(),
    };
    let states: Vec<VwapState> = states_inner
        .into_iter()
        .map(|inner| VwapState { inner })
        .collect();
    let js_outs: Vec<Vec<Float64Array>> = outs.into_iter().map(vecs_to_float64arrays).collect();
    js_pair(&env, js_outs, states)
}
