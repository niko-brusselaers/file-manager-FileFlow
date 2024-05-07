use async_std::{fs::OpenOptions, path::Path};
use magic_wormhole::{transfer::APP_CONFIG, transit, Code};

use super::{handler::{cancel, progress_handler, transit_handler}, helper::{gen_app_config, gen_relay_hints}, types::serverconfig::ServerConfig};


#[tauri::command]
pub async fn receive_files(code:String, download_directory:String)-> Result<(), String>{
    // create server config, relay hints, transit abilities and app config
    let server_config: ServerConfig= ServerConfig{
        rendezvous_url: String::from(APP_CONFIG.rendezvous_url),
        transit_url: String::from(transit::DEFAULT_RELAY_SERVER)  
    };

    let relay_hints = match gen_relay_hints(&server_config) {
        Ok(relay_hints) => relay_hints,
        Err(error) => { return  Err(error.to_string());}

    };
    
    let transit_abilities = transit::Abilities::ALL_ABILITIES;
    let app_config = gen_app_config(&server_config);


    let (wormhole_welcome,connection) = match magic_wormhole::Wormhole::connect_with_code(app_config,Code(code)).await {
        Ok(wormhole) => wormhole,
        Err(error) => return Err(error.to_string())
    } ;

    let receive_request = match magic_wormhole::transfer::request_file(
        connection, 
        relay_hints, 
        transit_abilities, 
        cancel()
    ).await {
        Ok(request) => {
            request.unwrap()
        },
        _ => return Err(String::from("Error while downloading file"))
    };

    let file_path= Path::new(&download_directory).join(&receive_request.filename);

    let mut file = match OpenOptions::new()
        .write(true)
        .create_new(true)
        .open(file_path)
        .await
    {
        Ok(f) => f,
        Err(error) => return Err(error.to_string()) 
    };

    let result = receive_request.accept(transit_handler, progress_handler, &mut file, cancel()).await;

    result.map_err(|e| e.to_string())?;

    Ok(())
}

