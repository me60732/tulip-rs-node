use napi::bindgen_prelude::*;
use napi::{Env, JsObject};
use napi_derive::napi;
use tulip_rs::indicator_types::TIndicatorState as _;
use tulip_rs::indicators::marketfi as rust_marketfi;

use crate::utils::{info_to_object, js_pair, map_error, InfoObject};

const IW: usize = rust_marketfi::INPUTS_WIDTH;
const OW: usize = rust_marketfi::OPTIONS_WIDTH;

// ── State class ──────────────────────────────────────────────────────────────

#[napi]
pub struct MarketfiState {
    pub(crate) inner: rust_marketfi::IndicatorState,
}

#[napi]
impl MarketfiState {
    /// Continue streaming: feed new bars into an existing state.
    #[napi]
    pub fn batch_indicator(&mut self, inputs: Vec<Vec<f64>>) -> Result<Vec<Vec<f64>>> {
        let input_arr: [&[f64]; IW] = inputs
            .iter()
            .map(|v| v.as_slice())
            .collect::<Vec<_>>()
            .try_into()
            .map_err(|_| Error::new(Status::InvalidArg, format!("Expected {IW} input series")))?;
        self.inner
            .batch_indicator(&input_arr, None)
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
        bincode::deserialize::<rust_marketfi::IndicatorState>(buf.as_ref())
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
        serde_json::from_str::<rust_marketfi::IndicatorState>(&json)
            .map(|inner| Self { inner })
            .map_err(|e| Error::new(Status::InvalidArg, e.to_string()))
    }
}

// ── Top-level functions ───────────────────────────────────────────────────────

/// Run the MARKETFI indicator. Returns `[outputs, state]` as a JS array.
/// `inputs`: `[[high, low, volume]]`   `options`: `[]`
#[napi]
pub fn marketfi_indicator(env: Env, inputs: Vec<Vec<f64>>, options: Vec<f64>) -> Result<JsObject> {
    let input_arr: [&[f64]; IW] = inputs
        .iter()
        .map(|v| v.as_slice())
        .collect::<Vec<_>>()
        .try_into()
        .map_err(|_| Error::new(Status::InvalidArg, format!("Expected {IW} input series")))?;

    let option_arr: [f64; OW] = options
        .try_into()
        .map_err(|_| Error::new(Status::InvalidArg, format!("Expected {OW} options")))?;

    let (outputs, inner) =
        rust_marketfi::indicator(&input_arr, &option_arr, None).map_err(map_error)?;
    js_pair(&env, outputs, MarketfiState { inner })
}

/// Static metadata for MARKETFI.
#[napi]
pub fn marketfi_info() -> InfoObject {
    info_to_object(rust_marketfi::info())
}

/// Minimum number of input bars needed to produce at least one output bar.
#[napi]
pub fn marketfi_min_data(options: Vec<f64>) -> u32 {
    rust_marketfi::min_data(&options) as u32
}


/// Minimum input bars needed to achieve a given decimal accuracy.
#[napi]
pub fn marketfi_min_data_accuracy(options: Vec<f64>, decimals: u32) -> u32 {
    rust_marketfi::min_data_accuracy(&options, decimals as usize) as u32
}

// ── SIMD — by assets ─────────────────────────────────────────────────────────

/// Run N assets through MARKETFI in a single SIMD pass (N = 2 | 4 | 8 | 16).
/// Returns `[outputs, states]` — both JS arrays of length N.
/// `inputs` shape: `[N][3][data_len]`
#[napi]
pub fn marketfi_simd_by_assets(
    env: Env,
    inputs: Vec<Vec<Vec<f64>>>,
    options: Vec<f64>,
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
        2 => rust_marketfi::by_assets::indicator::<2>(
            input_refs.as_slice().try_into().unwrap(),
            &option_arr,
            None,
        )
        .map_err(map_error)?,
        4 => rust_marketfi::by_assets::indicator::<4>(
            input_refs.as_slice().try_into().unwrap(),
            &option_arr,
            None,
        )
        .map_err(map_error)?,
        8 => rust_marketfi::by_assets::indicator::<8>(
            input_refs.as_slice().try_into().unwrap(),
            &option_arr,
            None,
        )
        .map_err(map_error)?,
        16 => rust_marketfi::by_assets::indicator::<16>(
            input_refs.as_slice().try_into().unwrap(),
            &option_arr,
            None,
        )
        .map_err(map_error)?,
        _ => unreachable!(),
    };

    let states: Vec<MarketfiState> = states_inner
        .into_iter()
        .map(|inner| MarketfiState { inner })
        .collect();
    js_pair(&env, outs, states)
}
