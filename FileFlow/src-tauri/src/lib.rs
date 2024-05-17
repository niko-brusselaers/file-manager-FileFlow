// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
mod file_management;
mod file_transfer;
mod miscellaneous;

use file_management::create::*;
use file_management::read::*;
use file_management::delete::*;
use file_transfer::receive::*;
use file_transfer::send::*;
use miscellaneous::get_device_name;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            read_directory,
            get_drives,
            open_file,
            check_path,
            create_file,
            create_folder,
            send_files,
            receive_files,
            get_device_name,
            delete_file_or_folder
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
