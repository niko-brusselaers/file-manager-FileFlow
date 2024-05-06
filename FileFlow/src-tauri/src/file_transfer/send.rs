use magic_wormhole::{transfer::APP_CONFIG, transit, Wormhole};
use super::{handler::{cancel,progress_handler,transit_handler}, helper::{gen_app_config, gen_relay_hints}, types::serverconfig::ServerConfig};

#[tauri::command]
pub async fn send_files(file_path:&str) -> Result<(), String>{
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

    
    let file_name = std::path::Path::new(file_path).file_name().unwrap().to_str().unwrap();
    
    //create wormhole connection and show error if any
    let (server_welcome, connection) = match Wormhole::connect_without_code(app_config, 3).await {
        Ok(wormhole) => wormhole,
        Err(error) => { 
            println!("{:#?}",error); 
            return Err(error.to_string())}
    };    


    //get code from server welcome
    let code = server_welcome.code;
    println!("code: {:#?}",code);

    //start sending file or folder
    let result = magic_wormhole::transfer::send_file_or_folder(
        connection.await.unwrap(), 
        relay_hints, 
        file_path, 
        file_name, 
        transit_abilities, 
        transit_handler, 
        progress_handler, 
        cancel()
    ).await.map_err(|error| println!("{:#?}",error));

    Ok(result.unwrap())
}

