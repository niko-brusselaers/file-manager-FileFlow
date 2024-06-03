use async_std::channel::{bounded, Sender};
use tauri::Manager;
use std::path::PathBuf;
use std::sync::{Arc, Mutex};
use std::{path, thread};
use notify::{RecommendedWatcher, Watcher, RecursiveMode};
use lazy_static::lazy_static;
use notify_debouncer_full::DebouncedEvent;

lazy_static! {
    static ref WATCHER: Arc<Mutex<Option<RecommendedWatcher>>> = Arc::new(Mutex::new(None));
    static ref TX: Arc<Mutex<Option<Sender<Result<DebouncedEvent, notify::Error>>>>> = Arc::new(Mutex::new(None));
}

#[tauri::command]
pub async fn watch_directory(path: String, app: tauri::AppHandle) -> Result<(), String> {
    let (tx, rx) = bounded::<Result<DebouncedEvent, notify::Error>>(100);

    // Store the sender in the Mutex
    *TX.lock().unwrap() = Some(tx);

    // Create a watcher object, delivering debounced events.
    let tx = TX.lock().unwrap().clone().unwrap();
    let mut new_watcher = notify::recommended_watcher(move |res: Result<notify::Event, notify::Error>| {
        let send = tx.send(res.map(|e| DebouncedEvent::from(e)));
        if let Err(e) = async_std::task::block_on(send) {
            eprintln!("Error sending event: {:?}", e.to_string());
        }
    }).map_err(|e| e.to_string())?;
    let path = PathBuf::from(path);

    // below will be monitored for changes.
    new_watcher.watch(&path, RecursiveMode::Recursive).map_err(|e| e.to_string())?;

    // Store the watcher in the Mutex
    *WATCHER.lock().unwrap() = Some(new_watcher);

    // Start a new thread to listen for changes
    thread::spawn(move || {
        while let Ok(event) = async_std::task::block_on(rx.recv()) {
            match event {
                Ok(_debounced_event) => {
                    let event_type = "";
                    let _ = app.emit("fs-change", event_type);
                    ()
                },
                Err(e) => eprintln!("Error receiving event: {:?}", e),
            }
        }
    });

    Ok(())
}

#[tauri::command]
pub async fn unwatch_directory(path: String) -> Result<(), String> {
    // Get the watcher from the Mutex
    let mut watcher = WATCHER.lock().unwrap();

    let path = path::PathBuf::from(path);

    // If a watcher exists, unwatch the path
    if let Some(watcher) = &mut *watcher {
        watcher.unwatch(&path).map_err(|e| e.to_string())?;
    }

    Ok(())
}