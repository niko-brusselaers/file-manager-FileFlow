use std::{collections::HashMap, sync::{atomic::{AtomicUsize, Ordering}, Arc, Mutex}};

use super::{
    handler::{cancel, progress_handler, transit_handler},
    helper::{gen_app_config, gen_relay_hints},
    types::ServerConfig,
};
use magic_wormhole::{transit, Wormhole};
use tauri::Manager;

#[tauri::command]
pub async fn send_files(file_path: &str,app: tauri::AppHandle) -> Result<(), String> {
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
        .unwrap()
        .to_string_lossy().into_owned();

    //create wormhole connection and show error if any
    let (server_welcome, connection) = match Wormhole::connect_without_code(app_config, 3).await {
        Ok(wormhole) => wormhole,
        Err(error) => {
            println!("{:#?}", error);
            return Err(error.to_string());
        }
    };

    //get code from server welcome
    let code = server_welcome.code;
    println!("code: {:#?}", code);

    //emit code to frontend
    app.emit("fileTransferCode", code.to_string()).unwrap();

    let wormhole = connection.await.unwrap();
    let mut progress_counters: HashMap<String, Arc<Mutex<AtomicUsize>>> = HashMap::new();
    progress_counters.insert("counter".to_string(), Arc::new(Mutex::new(AtomicUsize::new(0))));

    let counter = progress_counters.get("counter").unwrap().clone();

    // Clone the variables to be used in the progress handler
    let file_name_progressHandler = file_name.clone();
    

let result = magic_wormhole::transfer::send_file_or_folder(
    wormhole,
    relay_hints,
    file_path,
    &file_name,
    transit_abilities,
    transit_handler,
    move |current, total| {
        let count = counter.lock().unwrap().fetch_add(1, Ordering::Relaxed);
        let increment = 100;
        if count >= increment {
            // Call the original progress handler
            let _ = progress_handler(
                current, 
                total,
                &file_name_progressHandler,
                String::from("Send"),
                app.clone()).map_err(|error| error.to_string());
            
            counter.lock().unwrap().store(0, Ordering::Relaxed)
        }
    },
    cancel(),
)
.await;

    let result = result.map_err(|error| println!("{:#?}", error));

    

    Ok(result.unwrap())
}
