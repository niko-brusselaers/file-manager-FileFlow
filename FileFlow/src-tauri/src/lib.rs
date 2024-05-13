// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
mod file_management;
mod file_transfer;

use file_management::{check_path, get_drives, open_file, read_directory};
use file_transfer::{receive::receive_files, send::send_files};
use tauri::{Manager, State, Window};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let window = app.get_webview_window("main").unwrap();
            app.manage(window);
            Ok(())
        })
        .plugin(tauri_plugin_store::Builder::new().build())
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
