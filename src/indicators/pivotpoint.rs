use napi::bindgen_prelude::*;
use napi::{Env, JsObject};
use napi_derive::napi;
use tulip_rs::indicator_types::TIndicatorState as _;
use tulip_rs::indicators::pivotpoint::{indicator, min_data, IndicatorState, INFO};

use crate::utils::{
    info_to_object, inputs_to_array, js_pair, map_error, vecs_to_float64arrays, InfoObject,
};

// ── State class ──────────────────────────────────────────────────────────────

#[napi]
pub struct PivotpointState {
    pub(crate) inner: IndicatorState,
}

#[napi]
impl PivotpointState {
    /// Continue streaming: feed new bars into an existing state.
    #[napi]
    pub fn batch_indicator(
        &mut self,
        inputs: Vec<Float64Array>,
        optional_outputs: Option<Vec<bool>>,
    ) -> Result<Vec<Float64Array>> {
        let input_arr = inputs_to_array::<3>(&inputs)?;
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

/// Run the PivotPoint indicator. Returns `[outputs, state]` as a JS array.
/// `inputs`: `[[high, low, close]]`   `options`: `[period]`
#[napi]
pub fn pivotpoint_indicator(
    env: Env,
    inputs: Vec<Float64Array>,
    options: Vec<f64>,
    optional_outputs: Option<Vec<bool>>,
) -> Result<JsObject> {
    let input_arr = inputs_to_array::<3>(&inputs)?;

    let option_arr: [f64; 1] = options
        .try_into()
        .map_err(|_| Error::new(Status::InvalidArg, format!("Expected 1 options")))?;

    let (outputs, inner) =
        indicator(&input_arr, &option_arr, optional_outputs.as_deref()).map_err(map_error)?;
    js_pair(
        &env,
        vecs_to_float64arrays(outputs),
        PivotpointState { inner },
    )
}

/// Static metadata for PivotPoint.
#[napi]
pub fn pivotpoint_info() -> InfoObject {
    info_to_object(INFO)
}

/// Minimum number of input bars needed to produce at least one output bar.
#[napi]
pub fn pivotpoint_min_data(options: Vec<f64>) -> u32 {
    let option_arr: [f64; 1] = options
        .try_into()
        .map_err(|_| Error::new(Status::InvalidArg, format!("Expected 1 options")))
        .unwrap();
    min_data(&option_arr) as u32
}
