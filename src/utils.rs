use napi::bindgen_prelude::*;
use napi::{Env, JsObject, JsUnknown, NapiValue};
use napi_derive::napi;
use tulip_rs::types::Info;

// ── Typed-array output helpers ────────────────────────────────────────────────

/// Convert a `Vec<f64>` into a `Float64Array`, transferring ownership of the
/// allocation to V8.  Avoids the O(n) per-element boxing that occurs when
/// returning `Vec<f64>` as a plain JS `Array<number>`.
#[allow(dead_code)]
pub fn vec_to_float64array(data: Vec<f64>) -> Float64Array {
    Float64Array::new(data)
}

/// Convert `Vec<Vec<f64>>` into `Vec<Float64Array>` (`Array<Float64Array>` on
/// the JS side).  Each inner Vec is transferred with a single pointer handoff;
/// no per-element V8 API calls are made.
pub fn vecs_to_float64arrays(vecs: Vec<Vec<f64>>) -> Vec<Float64Array> {
    vecs.into_iter().map(Float64Array::new).collect()
}

// ── Info / metadata ───────────────────────────────────────────────────────────

/// One entry in the `displayGroups` list of an [`InfoObject`].
///
/// Each group describes a set of outputs that belong on the same rendering pane.
#[napi(object)]
pub struct DisplayGroupObject {
    /// Stable machine-readable key, e.g. `"adx_dx"` or `"true_range"`.
    pub id: String,
    /// Human-readable pane title, e.g. `"Directional Index"`.
    pub label: String,
    /// Where to render: `"Overlay"`, `"Indicator"`, or `"Volume"`.
    pub display_type: String,
    /// Output names belonging to this group (may include optional outputs).
    pub outputs: Vec<String>,
    pub offset: Option<String>,
}

/// Flat JS object returned by every `{name}Info()` function.
#[napi(object)]
pub struct InfoObject {
    pub name: String,
    pub full_name: String,
    pub inputs: Vec<String>,
    pub options: Vec<String>,
    pub outputs: Vec<String>,
    pub optional_outputs: Vec<String>,
    pub indicator_type: String,
    /// Groups of outputs that should be rendered together on the same pane.
    pub display_groups: Vec<DisplayGroupObject>,
}

/// Convert a tulip_rs `Info` struct into the napi-compatible `InfoObject`.
pub fn info_to_object(info: Info) -> InfoObject {
    let display_groups = info
        .display_groups
        .iter()
        .map(|g| DisplayGroupObject {
            id: g.id.to_string(),
            label: g.label.to_string(),
            display_type: format!("{:?}", g.display_type),
            outputs: g.outputs.iter().map(|s| s.to_string()).collect(),
            offset: g.offset.map(|s| s.to_string()),
        })
        .collect();

    InfoObject {
        name: info.name.to_string(),
        full_name: info.full_name.to_string(),
        inputs: info.inputs.iter().map(|s| s.to_string()).collect(),
        options: info.options.iter().map(|s| s.to_string()).collect(),
        outputs: info.outputs.iter().map(|s| s.to_string()).collect(),
        optional_outputs: info
            .optional_outputs
            .iter()
            .map(|s| s.to_string())
            .collect(),
        indicator_type: format!("{:?}", info.indicator_type),
        display_groups,
    }
}

// ── Input-array conversion ───────────────────────────────────────────────────

/// Convert a `&[Float64Array]` into `[&[f64]; N]`, validating that exactly
/// `N` series were supplied.  Replaces the verbose
/// `.iter().map().collect::<Vec<_>>().try_into().map_err(...)` chain that
/// otherwise appears in every indicator binding function.
pub fn inputs_to_array<const N: usize>(inputs: &[Float64Array]) -> Result<[&[f64]; N]> {
    if inputs.len() != N {
        return Err(Error::new(
            Status::InvalidArg,
            format!("Expected {N} input series"),
        ));
    }
    Ok(std::array::from_fn(|i| inputs[i].as_ref()))
}

// ── Misc helpers ──────────────────────────────────────────────────────────────

/// Convert any `Display` error into a napi `Error`.
pub fn map_error<E: std::fmt::Display>(e: E) -> Error {
    Error::new(Status::GenericFailure, e.to_string())
}

/// Convert a Rust value implementing `ToNapiValue` into a `JsUnknown`.
/// Used to build JS arrays containing mixed napi types.
pub fn to_unknown<T: ToNapiValue>(env: &Env, val: T) -> Result<JsUnknown> {
    let raw = unsafe { T::to_napi_value(env.raw(), val)? };
    Ok(unsafe { JsUnknown::from_raw_unchecked(env.raw(), raw) })
}

/// Build a two-element JS array `[a, b]`.
pub fn js_pair<A: ToNapiValue, B: ToNapiValue>(env: &Env, a: A, b: B) -> Result<JsObject> {
    let mut arr = env.create_array_with_length(2)?;
    arr.set_element(0u32, to_unknown(env, a)?)?;
    arr.set_element(1u32, to_unknown(env, b)?)?;
    Ok(arr)
}
