use async_std::{fs::OpenOptions, path::Path};
use magic_wormhole::{transfer::APP_CONFIG, transit, Code};

use crate::miscellaneous::gen_available_file_name;

use super::{
    handler::{cancel, progress_handler, transit_handler},
    helper::{gen_app_config, gen_relay_hints},
    types::ServerConfig,
};

#[tauri::command]
pub async fn receive_files(
    code: String,
    download_directory: String,
    app: tauri::AppHandle,
) -> Result<(), String> {
    // create server config, relay hints, transit abilities and app config
    let server_config: ServerConfig = ServerConfig {
        rendezvous_url: String::from(APP_CONFIG.rendezvous_url),
        transit_url: String::from(transit::DEFAULT_RELAY_SERVER),
    };

    let relay_hints = match gen_relay_hints(&server_config) {
        Ok(relay_hints) => relay_hints,
        Err(error) => {
            return Err(error.to_string());
        }
    };

    let transit_abilities = transit::Abilities::ALL_ABILITIES;
    let app_config = gen_app_config(&server_config);

    

    let connection = match magic_wormhole::Wormhole::connect_with_code(app_config, Code(code)).await
    {
        Ok(wormhole) => wormhole.1,
        Err(error) => return Err(error.to_string()),
    };

    let receive_request = match magic_wormhole::transfer::request_file(
        connection,
        relay_hints,
        transit_abilities,
        cancel(),
    )
    .await
    {
        Ok(request) => request.unwrap(),
        _ => return Err(String::from("Error while downloading file")),
    };

    let file_path = gen_available_file_name(
        Path::new(&download_directory)
            .join(&receive_request.filename)
            .into(),
    )
    .await;
    let file_name = &receive_request.filename.to_string_lossy().into_owned();

    println!("File Path: {:?}", file_path);

    let mut file = match OpenOptions::new()
        .write(true)
        .create_new(true)
        .open(file_path)
        .await
    {
        Ok(f) => f,
        Err(error) => return Err(error.to_string()),
    };

    println!("Downloading file: {}", file_name);

    // Clone the variables to be used in the progress handler
    let file_name_progress_handler = file_name.clone();
    let app_progress_handler = app.clone();

    let result = receive_request
        .accept(
            transit_handler,
            move |current, total| {
                // Call progress handler
                let _ = progress_handler(
                    current,
                    total,
                    &file_name_progress_handler,
                    String::from("Receive"),
                    app_progress_handler.clone(),
                );
            },
            &mut file,
            cancel(),
        )
        .await;

    let result = result.map_err(|error| error.to_string())?;

    Ok(result)
}
