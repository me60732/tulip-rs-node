use napi::bindgen_prelude::*;
use napi::{Env, JsObject};
use napi_derive::napi;
use tulip_rs::indicator_types::TIndicatorState as _;
use tulip_rs::indicators::pvi as rust_pvi;

use crate::utils::{info_to_object, js_pair, map_error, InfoObject};

const IW: usize = rust_pvi::INPUTS_WIDTH;
const OW: usize = rust_pvi::OPTIONS_WIDTH;

// ── State class ──────────────────────────────────────────────────────────────

#[napi]
pub struct PviState {
    pub(crate) inner: rust_pvi::IndicatorState,
}

#[napi]
impl PviState {
    /// Continue streaming: feed new bars into an existing state.
    #[napi]
    pub fn batch_indicator(&mut self, inputs: Vec<Vec<f64>>, optional_outputs: Option<Vec<bool>>) -> Result<Vec<Vec<f64>>> {
        let input_arr: [&[f64]; IW] = inputs
            .iter()
            .map(|v| v.as_slice())
            .collect::<Vec<_>>()
            .try_into()
            .map_err(|_| Error::new(Status::InvalidArg, format!("Expected {IW} input series")))?;
        self.inner
            .batch_indicator(&input_arr, optional_outputs.as_deref())
            .map_err(map_error)
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
        bincode::deserialize::<rust_pvi::IndicatorState>(buf.as_ref())
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
        serde_json::from_str::<rust_pvi::IndicatorState>(&json)
            .map(|inner| Self { inner })
            .map_err(|e| Error::new(Status::InvalidArg, e.to_string()))
    }
}

// ── Top-level functions ───────────────────────────────────────────────────────

/// Run the PVI indicator. Returns `[outputs, state]` as a JS array.
/// `inputs`: `[[close, volume]]`
#[napi]
pub fn pvi_indicator(env: Env, inputs: Vec<Vec<f64>>, optional_outputs: Option<Vec<bool>>) -> Result<JsObject> {
    let input_arr: [&[f64]; IW] = inputs
        .iter()
        .map(|v| v.as_slice())
        .collect::<Vec<_>>()
        .try_into()
        .map_err(|_| Error::new(Status::InvalidArg, format!("Expected {IW} input series")))?;

    let option_arr: [f64; OW] = [];

    let (outputs, inner) = rust_pvi::indicator(&input_arr, &option_arr, optional_outputs.as_deref()).map_err(map_error)?;
    js_pair(&env, outputs, PviState { inner })
}

/// Static metadata for PVI.
#[napi]
pub fn pvi_info() -> InfoObject {
    info_to_object(rust_pvi::info())
}

/// Minimum number of input bars needed to produce at least one output bar.
#[napi]
pub fn pvi_min_data() -> u32 {
    rust_pvi::min_data(&[]) as u32
}


/// Minimum input bars needed to achieve a given decimal accuracy.
#[napi]
pub fn pvi_min_data_accuracy(decimals: u32) -> u32 {
    rust_pvi::min_data_accuracy(&[], decimals as usize) as u32
}

// ── SIMD — by assets ─────────────────────────────────────────────────────────

/// Run N assets through PVI in a single SIMD pass (N = 2 | 4 | 8 | 16).
/// Returns `[outputs, states]` — both JS arrays of length N.
/// `inputs` shape: `[N][2][data_len]`
#[napi]
pub fn pvi_simd_by_assets(env: Env, inputs: Vec<Vec<Vec<f64>>>, optional_outputs: Option<Vec<bool>>) -> Result<JsObject> {
    let n = inputs.len();
    if !matches!(n, 2 | 4 | 8 | 16) {
        return Err(Error::new(
            Status::InvalidArg,
            format!("SIMD lane count must be 2, 4, 8, or 16; got {n}"),
        ));
    }

    let option_arr: [f64; OW] = [];

    let asset_vecs: Vec<Vec<&[f64]>> = inputs
        .iter()
        .map(|asset| asset.iter().map(|v| v.as_slice()).collect())
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
        2 => rust_pvi::by_assets::indicator::<2>(
            input_refs.as_slice().try_into().unwrap(),
            &option_arr,
            optional_outputs.as_deref(),
        )
        .map_err(map_error)?,
        4 => rust_pvi::by_assets::indicator::<4>(
            input_refs.as_slice().try_into().unwrap(),
            &option_arr,
            optional_outputs.as_deref(),
        )
        .map_err(map_error)?,
        8 => rust_pvi::by_assets::indicator::<8>(
            input_refs.as_slice().try_into().unwrap(),
            &option_arr,
            optional_outputs.as_deref(),
        )
        .map_err(map_error)?,
        16 => rust_pvi::by_assets::indicator::<16>(
            input_refs.as_slice().try_into().unwrap(),
            &option_arr,
            optional_outputs.as_deref(),
        )
        .map_err(map_error)?,
        _ => unreachable!(),
    };

    let states: Vec<PviState> = states_inner
        .into_iter()
        .map(|inner| PviState { inner })
        .collect();
    js_pair(&env, outs, states)
}
