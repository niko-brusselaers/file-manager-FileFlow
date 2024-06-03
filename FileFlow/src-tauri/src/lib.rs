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
use miscellaneous::*;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let result = panic::catch_unwind(|| {
        tauri::Builder::default()
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
                delete_item
            ])
            .run(tauri::generate_context!())
    });

    match result {
        Ok(_) => println!("No panic occurred."),
        Err(err) => println!("A panic occurred: {:?}", err),
    }
}