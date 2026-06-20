use napi::bindgen_prelude::*;
use napi::{Env, JsObject};
use napi_derive::napi;
use tulip_rs::indicator_types::TIndicatorState as _;
use tulip_rs::indicators::trvi as rust_trvi;

use crate::utils::{info_to_object, js_pair, map_error, inputs_to_array, vecs_to_float64arrays, InfoObject};

const IW: usize = rust_trvi::INPUTS_WIDTH;
const OW: usize = rust_trvi::OPTIONS_WIDTH;

// ── State class ──────────────────────────────────────────────────────────────

#[napi]
pub struct TrviState {
    pub(crate) inner: rust_trvi::IndicatorState,
}

#[napi]
impl TrviState {
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
        bincode::deserialize::<rust_trvi::IndicatorState>(buf.as_ref())
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
        serde_json::from_str::<rust_trvi::IndicatorState>(&json)
            .map(|inner| Self { inner })
            .map_err(|e| Error::new(Status::InvalidArg, e.to_string()))
    }
}

// ── Top-level functions ───────────────────────────────────────────────────────

/// Run the TRVI indicator. Returns `[outputs, state]` as a JS array.
/// `inputs`: `[[high, low, close]]`   `options`: `[period]`
#[napi]
pub fn trvi_indicator(
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
        rust_trvi::indicator(&input_arr, &option_arr, optional_outputs.as_deref())
            .map_err(map_error)?;
    js_pair(&env, vecs_to_float64arrays(outputs), TrviState { inner })
}

/// Static metadata for TRVI.
#[napi]
pub fn trvi_info() -> InfoObject {
    info_to_object(rust_trvi::INFO)
}

/// Minimum number of input bars needed to produce at least one output bar.
#[napi]
pub fn trvi_min_data(options: Vec<f64>) -> u32 {
    rust_trvi::min_data(&options) as u32
}


// ── SIMD — by assets ─────────────────────────────────────────────────────────

/// Run N assets through TRVI in a single SIMD pass (N = 2 | 4 | 8 | 16).
/// Returns `[outputs, states]` — both JS arrays of length N.
/// `inputs` shape: `[N][3][data_len]`
#[napi]
pub fn trvi_simd_by_assets(
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
        2 => rust_trvi::by_assets::indicator::<2>(
            input_refs.as_slice().try_into().unwrap(),
            &option_arr,
            optional_outputs.as_deref(),
        )
        .map_err(map_error)?,
        4 => rust_trvi::by_assets::indicator::<4>(
            input_refs.as_slice().try_into().unwrap(),
            &option_arr,
            optional_outputs.as_deref(),
        )
        .map_err(map_error)?,
        8 => rust_trvi::by_assets::indicator::<8>(
            input_refs.as_slice().try_into().unwrap(),
            &option_arr,
            optional_outputs.as_deref(),
        )
        .map_err(map_error)?,
        16 => rust_trvi::by_assets::indicator::<16>(
            input_refs.as_slice().try_into().unwrap(),
            &option_arr,
            optional_outputs.as_deref(),
        )
        .map_err(map_error)?,
        _ => unreachable!(),
    };

    let states: Vec<TrviState> = states_inner
        .into_iter()
        .map(|inner| TrviState { inner })
        .collect();
    let js_outs: Vec<Vec<Float64Array>> = outs.into_iter().map(vecs_to_float64arrays).collect();
    js_pair(&env, js_outs, states)
}

// ── SIMD — by options ────────────────────────────────────────────────────────

/// Run N option-sets against the same TRVI input in a single SIMD pass (N = 2 | 4 | 8 | 16).
/// Returns `[outputs, states]` — both JS arrays of length N.
/// `inputs`: `[[high, low, close]]`   `options_list`: `[N][1]`
#[napi]
pub fn trvi_simd_by_options(
    env: Env,
    inputs: Vec<Float64Array>,
    options_list: Vec<Vec<f64>>,
    optional_outputs: Option<Vec<bool>>,
) -> Result<JsObject> {
    let n = options_list.len();
    if !matches!(n, 2 | 4 | 8 | 16) {
        return Err(Error::new(
            Status::InvalidArg,
            format!("SIMD lane count must be 2, 4, 8, or 16; got {n}"),
        ));
    }

    let input_arr = inputs_to_array::<IW>(&inputs)?;

    let option_arrs: Vec<[f64; OW]> = options_list
        .into_iter()
        .map(|o| {
            let arr: [f64; 1] = [o[0]];
            Ok(arr)
        })
        .collect::<Result<_>>()?;

    let option_refs: Vec<&[f64; OW]> = option_arrs.iter().collect();

    let (outs, states_inner) = match n {
        2 => rust_trvi::by_options::indicator::<2>(
            &input_arr,
            option_refs.as_slice().try_into().unwrap(),
            optional_outputs.as_deref(),
        )
        .map_err(map_error)?,
        4 => rust_trvi::by_options::indicator::<4>(
            &input_arr,
            option_refs.as_slice().try_into().unwrap(),
            optional_outputs.as_deref(),
        )
        .map_err(map_error)?,
        8 => rust_trvi::by_options::indicator::<8>(
            &input_arr,
            option_refs.as_slice().try_into().unwrap(),
            optional_outputs.as_deref(),
        )
        .map_err(map_error)?,
        16 => rust_trvi::by_options::indicator::<16>(
            &input_arr,
            option_refs.as_slice().try_into().unwrap(),
            optional_outputs.as_deref(),
        )
        .map_err(map_error)?,
        _ => unreachable!(),
    };

    let states: Vec<TrviState> = states_inner
        .into_iter()
        .map(|inner| TrviState { inner })
        .collect();
    let js_outs: Vec<Vec<Float64Array>> = outs.into_iter().map(vecs_to_float64arrays).collect();
    js_pair(&env, js_outs, states)
}
