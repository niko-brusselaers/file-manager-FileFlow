// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
mod file_management;
mod file_transfer;

use file_management::{get_drives, open_file, read_directory,check_path};
use file_transfer::{send::send_files,receive::receive_files};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            read_directory,
            get_drives,
            open_file,
            send_files,
            check_path,
            receive_files
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
