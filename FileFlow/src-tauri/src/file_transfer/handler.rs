use std::net::SocketAddr;
use futures::future::BoxFuture;
use futures::FutureExt;
use magic_wormhole::transit::TransitInfo;
use async_std::{path::PathBuf, sync::{Arc, Condvar, Mutex}};
use serde_json::json;
use tauri::{Manager, Wry};
use tauri_plugin_store::StoreCollection;

use super::types::FileProgress;


pub fn transit_handler (info: TransitInfo, addr: SocketAddr) {
        println!("Transit info: {:?}", info);
        println!("Socket address: {:?}", addr);
    }


#[tauri::command]
pub fn progress_handler(current: u64, total: u64,file_name:String,direction:String,app: tauri::AppHandle) -> Result<(), String> {
    
    // Get the state of the StoreCollection from the app handle and define the path to the store file
    let stores = app.app_handle().state::<StoreCollection<Wry>>();
    let path = PathBuf::from("fileTransfers.bin");

    
    let result = tauri_plugin_store::with_store(app.app_handle().clone(), stores, path, |store| {
        let file_progress = FileProgress {
            file_name: String::from(file_name),
            file_size: total,
            progress: current,
            direction: String::from(direction),
        };

        store.insert(file_progress.file_name.clone(), json!(file_progress))?;

        store.save()?;
        Ok(())
    });

    result.map_err(|e| e.to_string())?;

  Ok(())
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