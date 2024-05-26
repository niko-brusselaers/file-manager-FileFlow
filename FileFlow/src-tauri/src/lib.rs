// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
mod file_management;
mod file_transfer;
mod miscellaneous;

use std::panic;

use file_management::create::*;
use file_management::read::*;
use file_management::delete::*;
use file_transfer::receive::*;
use file_transfer::send::*;
use file_management::update::*;
use file_management::watcher::*;
use miscellaneous::get_device_name;
use serde_json::json;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let result = panic::catch_unwind(|| {
        tauri::Builder::default()
            .plugin(tauri_plugin_store::Builder::new().build())
            .plugin(tauri_plugin_dialog::init())
            .plugin(tauri_plugin_shell::init())
            // .plugin(
            //     tauri_plugin_aptabase::Builder::new("A-EU-4327902903")
            //         .with_panic_hook(Box::new(|client, info, msg| {
            //         let location = info.location().map(|loc| format!("{}:{}:{}", loc.file(), loc.line(), loc.column())).unwrap_or_else(|| "".to_string());

            //         client.track_event("panic", Some(json!({
            //         "info": format!("{} ({})", msg, location),
            //         })));
            //         }))
            //         .build(),
            // )
            .invoke_handler(tauri::generate_handler![
                get_device_name,
                read_directory,
                watch_directory,
                unwatch_directory,
                get_drives,
                open_file,
                check_path,
                create_file,
                create_folder,
                rename_item,
                move_item,
                copy_item,
                send_files,
                receive_files,
                delete_item
            ])
            .run(tauri::generate_context!())
    });

    match result {
        Ok(_) => println!("No panic occurred."),
        Err(err) => println!("A panic occurred: {:?}", err),
    }
}