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

pub fn store_file_transfer_progress(file_progress: FileProgress, app: tauri::AppHandle) -> Result<(), String> {
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

pub fn remove_file_transfer_progress(file_name:&String,app:tauri::AppHandle) -> Result<(), String>{
    //Get the state of the StoreCollection from the app handle and define the path to the store file
    let stores = app.app_handle().state::<StoreCollection<Wry>>();
    let path = PathBuf::from("fileTransfers.bin");

    //remove stored value based on the key
    let result = tauri_plugin_store::with_store(app.app_handle().clone(), stores, path, |store| {

        store.delete(file_name)?;

        store.save()?;

        Ok(())
    });

    let result = result.map_err(|e| e.to_string())?;

    Ok(result)
}

pub async fn gen_available_file_name(file_path:async_std::path::PathBuf) -> String{

    if file_path.exists().await {
        let mut file_name = file_path.file_stem().unwrap().to_str().unwrap().to_string();
        let file_extension = file_path.extension().unwrap().to_str().unwrap().to_string();
        let parent_path = file_path.parent().unwrap().to_str().unwrap().to_string();

        let mut i = 1;

        //check if file is already a copy and set i to the copy number
        if file_name.contains("(") && file_name.contains(")"){
            let file_name_parts: Vec<&str> = file_name.split("(").collect();
            let new_file_name = file_name_parts[0];
            let file_name_parts: Vec<&str> = file_name_parts[1].split(")").collect();
            i = file_name_parts[0].parse::<i32>().unwrap();
            file_name = new_file_name.to_string();
        } 


        //loop until a unique file name is generated
        loop {
            let new_file_name = format!("{}({}).{}", file_name, i, file_extension);
            let new_file_path = format!("{}/{}", parent_path, new_file_name);

            if !PathBuf::from(&new_file_path).exists() {
                return new_file_path;
            }

            i += 1;
        }
    } else {
        file_path.to_string_lossy().into_owned()    
    }
}
