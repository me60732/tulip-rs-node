use napi::bindgen_prelude::*;
use napi::{Env, JsObject};
use napi_derive::napi;

use tulip_rs::candle_indicators::candle_patterns::CandlePattern;
use tulip_rs::candle_indicators::types::ForecastType as RustForecastType;
use tulip_rs::indicators::candlestick::{min_data, IndicatorState, INFO};

use crate::utils::{info_to_object, inputs_to_array, js_pair, map_error, InfoObject};

// ── ForecastType string enum ────────────────────────────────────────────────────

/// Filter candlestick results by forecast direction.
/// Pass as the optional third argument to `candlestickIndicator` or
/// `CandlestickState.batchIndicator` to restrict output to one forecast class.
#[napi(string_enum)]
pub enum ForecastType {
    BearishReversal,
    BullishReversal,
    BearishContinuation,
    BullishContinuation,
    BearishReversalOrContinuation,
    BullishReversalOrContinuation,
}

fn to_rust_forecast(f: ForecastType) -> RustForecastType {
    match f {
        ForecastType::BearishReversal => RustForecastType::BearishReversal,
        ForecastType::BullishReversal => RustForecastType::BullishReversal,
        ForecastType::BearishContinuation => RustForecastType::BearishContinuation,
        ForecastType::BullishContinuation => RustForecastType::BullishContinuation,
        ForecastType::BearishReversalOrContinuation => {
            RustForecastType::BearishReversalOrContinuation
        }
        ForecastType::BullishReversalOrContinuation => {
            RustForecastType::BullishReversalOrContinuation
        }
    }
}

// ── Pattern output type ───────────────────────────────────────────────────────

/// A single detected candlestick pattern on a bar.
#[napi(object)]
pub struct CandlePatternObject {
    pub name: String,
    pub full_name: String,
    pub japanese_name: String,
    pub bars: u32,
    pub forecast: String,
}

fn pattern_to_object(p: CandlePattern) -> CandlePatternObject {
    let info = p.get_info();
    CandlePatternObject {
        name: format!("{:?}", p),
        full_name: info.full_name.to_string(),
        japanese_name: info.japanese_name.to_string(),
        bars: info.bars as u32,
        forecast: format!("{:?}", info.forecast),
    }
}

fn convert_patterns(raw: Vec<Option<Vec<CandlePattern>>>) -> Vec<Option<Vec<CandlePatternObject>>> {
    raw.into_iter()
        .map(|entry| entry.map(|ps| ps.into_iter().map(pattern_to_object).collect()))
        .collect()
}

// ── State class ──────────────────────────────────────────────────────────────

#[napi]
pub struct CandlestickState {
    pub(crate) inner: IndicatorState,
}

#[napi]
impl CandlestickState {
    /// Continue streaming: feed new bars into an existing state.
    /// Returns `Array<null | CandlePatternObject[]>` — one entry per output bar.
    #[napi]
    pub fn batch_indicator(
        &mut self,
        inputs: Vec<Float64Array>,
        forecast_type: Option<ForecastType>,
    ) -> Result<Vec<Option<Vec<CandlePatternObject>>>> {
        let input_arr = inputs_to_array::<4>(&inputs)?;
        let raw = self
            .inner
            .batch_indicator(&input_arr, forecast_type.map(to_rust_forecast))
            .map_err(map_error)?;
        Ok(convert_patterns(raw))
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

    /// Serialize state to a JSON string.
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

/// Run the candlestick indicator. Returns `[patterns, state]` as a JS array.
/// `inputs`:  `[open, high, low, close]`
/// `options`: `[candle_period, trend_period, trend_signal_period]`
/// Each element of `patterns` is `null` (no match) or an array of `CandlePatternObject`.
#[napi]
pub fn candlestick_indicator(
    env: Env,
    inputs: Vec<Float64Array>,
    options: Vec<f64>,
    forecast_type: Option<ForecastType>,
) -> Result<JsObject> {
    let input_arr = inputs_to_array::<4>(&inputs)?;

    let option_arr: [f64; 3] = options
        .try_into()
        .map_err(|_| Error::new(Status::InvalidArg, format!("Expected 3 options")))?;

    let (raw_patterns, inner) = tulip_rs::indicators::candlestick::indicator(
        &input_arr,
        &option_arr,
        forecast_type.map(to_rust_forecast),
    )
    .map_err(map_error)?;

    let patterns = convert_patterns(raw_patterns);
    js_pair(&env, patterns, CandlestickState { inner })
}

/// Static metadata for the candlestick indicator.
#[napi]
pub fn candlestick_info() -> InfoObject {
    info_to_object(INFO)
}

/// Minimum number of input bars needed to produce at least one output bar.
#[napi]
pub fn candlestick_min_data(options: Vec<f64>) -> u32 {
    min_data(&options) as u32
}
