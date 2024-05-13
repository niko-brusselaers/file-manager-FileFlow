use std::net::SocketAddr;
use futures::future::BoxFuture;
use futures::FutureExt;
use magic_wormhole::transit::TransitInfo;
use async_std::{path::PathBuf, sync::{Arc, Condvar, Mutex}};
use serde_json::json;
use tauri::{Manager, Wry};
use tauri_plugin_store::StoreCollection;

use super::{helper::store_file_transfer_progress, types::FileProgress};


pub fn transit_handler (info: TransitInfo, addr: SocketAddr) {
        println!("Transit info: {:?}", info);
        println!("Socket address: {:?}", addr);
    }


pub fn progress_handler(
    current: u64, 
    total: u64,
    file_name:&String,
    direction:String,
    app: tauri::AppHandle) -> Result<(), String> {

    // Create a FileProgress struct to store the file transfer progress
    let file_progress = FileProgress {
        file_name: String::from(file_name),
        file_size: total,
        progress: current,
        direction: String::from(direction),
    };
    // Store the file transfer progress
    let result = store_file_transfer_progress(file_progress, app.clone()).map_err(|error|error.to_string())?;

    Ok(result)
}


pub fn cancel<'a>() -> BoxFuture<'a, ()> {
    let notifier = Arc::new((Mutex::new(false), Condvar::new()));
    return async move {
        let (lock, cvar) = &*notifier;
        let mut started = lock.lock().await;
        while !*started {
            started = cvar.wait(started).await;
        }
    }
    .boxed();
}