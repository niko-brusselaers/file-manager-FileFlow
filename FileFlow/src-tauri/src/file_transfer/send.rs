use std::ffi::OsStr;

use super::{
    handler::{cancel, progress_handler, transit_handler},
    helper::{gen_app_config, gen_relay_hints, store_file_transfer_progress},
    types::{FileProgress, ServerConfig},
};
use magic_wormhole::{transit, Wormhole};
use tauri::Manager;

#[tauri::command]
pub async fn send_files(file_path: &str, app: tauri::AppHandle) -> Result<(), String> {
    // create server config, relay hints, transit abilities and app config
    let server_config: ServerConfig = ServerConfig {
        rendezvous_url: String::from("ws://relay.magic-wormhole.io:4000/v1"),
        transit_url: String::from("tcp://transit.magic-wormhole.io:4001"),
    };

    let relay_hints = match gen_relay_hints(&server_config) {
        Ok(relay_hints) => relay_hints,
        Err(error) => {
            return Err(error.to_string());
        }
    };
    let transit_abilities = transit::Abilities::ALL_ABILITIES;

    let app_config = gen_app_config(&server_config);

    let file_name = std::path::Path::new(file_path)
        .file_name()
        .unwrap_or(OsStr::new(""))
        .to_string_lossy()
        .into_owned();

    //create wormhole connection and show error if any
    let (server_welcome, connection) = match Wormhole::connect_without_code(app_config, 3).await {
        Ok(wormhole) => wormhole,
        Err(error) => {
            return Err(error.to_string());
        }
    };

    //get code from server welcome and emit to frontend
    let code = server_welcome.code;
    app.emit("fileTransferCode", code.to_string()).map_err(|error| error.to_string())?;

    //store start of sending progress
    // Create a FileProgress struct to store the file transfer progress
    let file_progress = FileProgress {
        file_name: String::from(&file_name),
        file_size: std::path::Path::new(file_path).metadata().map_err(|error| error.to_string())?.len(),
        progress: 0,
        direction: String::from("Send"),
    };
    // Store the file transfer progress
    store_file_transfer_progress(file_progress, app.clone()).map_err(|error| error.to_string())?;

    let wormhole = connection.await.map_err(|error| error.to_string())?;

    // Clone the variables to be used in the progress handler
    let file_name_progress_handler = file_name.clone();
    let app_progress_handler = app.clone();

    let result = magic_wormhole::transfer::send_file_or_folder(
        wormhole,
        relay_hints,
        file_path,
        &file_name,
        transit_abilities,
        transit_handler,
        move |current, total| {
            // Call progress handler
            let _ = progress_handler(
                current,
                total,
                &file_name_progress_handler,
                String::from("Send"),
                app_progress_handler.clone(),
            )
            .map_err(|error| error.to_string());
        },
        cancel(),
    )
    .await;

    result.map_err(|error| error.to_string())?;

    Ok(())
}
