use std::{borrow::Cow, path::PathBuf};

use magic_wormhole::{
    transfer::{AppVersion, APPID},
    transit::{RelayHint, RelayHintParseError},
    AppConfig,
};
use serde_json::json;
use tauri::{Manager, Wry};
use tauri_plugin_store::StoreCollection;

use super::types::{FileProgress, ServerConfig};

//generate default relay hints
pub fn gen_relay_hints(
    server_config: &ServerConfig,
) -> Result<Vec<RelayHint>, RelayHintParseError> {
    let mut relay_hints: Vec<RelayHint> = Vec::new();

    relay_hints.push(RelayHint::from_urls(
        None,
        server_config.transit_url.parse(),
    )?);

    Ok(relay_hints)
}

pub fn gen_app_config(server_config: &ServerConfig) -> AppConfig<AppVersion> {
    AppConfig {
        id: APPID,
        rendezvous_url: Cow::from(server_config.rendezvous_url.clone()),
        app_version: AppVersion {},
    }
}

pub fn store_file_transfer_progress(
    file_progress: FileProgress,
    app: tauri::AppHandle,
) -> Result<(), String> {
    // Get the state of the StoreCollection from the app handle and define the path to the store file
    let stores = app.app_handle().state::<StoreCollection<Wry>>();
    let path = PathBuf::from("fileTransfers.bin");

    // Store the file transfer progress in the store file and save it
    let result = tauri_plugin_store::with_store(app.app_handle().clone(), stores, path, |store| {
        store.insert(file_progress.file_name.clone(), json!(file_progress))?;

        store.save()?;

        Ok(())
    });

    let result = result.map_err(|e| e.to_string())?;

    Ok(result)
}

