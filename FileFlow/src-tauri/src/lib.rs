// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
mod file_management;
mod file_transfer;
mod miscellaneous;

use std::panic;
use std::sync::Mutex;
use lazy_static::lazy_static;
use tauri::AppHandle;
use tauri::Manager; // For the event system

use file_management::create::*;
use file_management::read::*;
use file_management::delete::*;
use file_transfer::receive::*;
use file_transfer::send::*;
use file_management::update::*;
use file_management::watcher::*;
use miscellaneous::*;

lazy_static! {
    static ref APP_HANDLE: Mutex<Option<AppHandle>> = Mutex::new(None);
}

fn set_panic_hook() {
    panic::set_hook(Box::new(|panic_info| {
        let message = format!("A panic occurred: {:?}", panic_info);
        eprintln!("{}", message);
        
        if let Some(app_handle) = APP_HANDLE.lock().unwrap().as_ref() {
            app_handle.emit("debugError", message).unwrap_or_else(|err| {
                eprintln!("Failed to emit DebugError event: {:?}", err);
            });
        } else {
            eprintln!("App handle is not set. Cannot emit DebugError event.");
        }
    }));
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    set_panic_hook();

    let result = panic::catch_unwind(|| {
        tauri::Builder::default()
            .setup(|app| {
                *APP_HANDLE.lock().unwrap() = Some(app.handle().clone());
                Ok(())
            })
            .plugin(tauri_plugin_store::Builder::new().build())
            .plugin(tauri_plugin_dialog::init())
            .plugin(tauri_plugin_shell::init())
            .invoke_handler(tauri::generate_handler![
                get_device_name,
                get_os_type,
                read_directory,
                watch_directory,
                unwatch_directory,
                get_drives,
                search_device,
                open_file,
                check_path,
                create_file,
                create_folder,
                rename_item,
                move_item,
                copy_item,
                send_files,
                receive_files,
                decline_request,
                delete_item
            ])
            .run(tauri::generate_context!())
            .expect("error while running tauri application");
    });

    if let Err(err) = result {
        eprintln!("Application panicked: {:?}", err);
    }
}
