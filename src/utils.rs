use napi::bindgen_prelude::*;
use napi::{Env, JsObject, JsUnknown, NapiValue};
use napi_derive::napi;
use tulip_rs::types::Info;

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
    pub display_type: String,
}

/// Convert a tulip_rs `Info` struct into the napi-compatible `InfoObject`.
pub fn info_to_object(info: Info<'static>) -> InfoObject {
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
        display_type: format!("{:?}", info.display_type),
    }
}

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
