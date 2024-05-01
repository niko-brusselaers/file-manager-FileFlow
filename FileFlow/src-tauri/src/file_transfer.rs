use magic_wormhole::{transfer::APP_CONFIG, Wormhole};



#[tauri::command]
pub async fn send_files() -> Result<String,String>{

    let config = APP_CONFIG;

    let wormhole = Wormhole::connect_without_code(config, 20);

    let wormhole = wormhole.await;

    let wormhole = wormhole.map_err(|e| e.to_string())?;

    Ok(wormhole.0.welcome.unwrap())
    
}