// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs;
use std::path::Path;
use sysinfo::Disks;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn read_folder_content(path: &Path) -> Vec<String> {
    let paths = fs::read_dir(path)
        .unwrap()
        .map(|res| res.map(|e| e.path()))
        .collect::<Result<Vec<_>, std::io::Error>>()
        .unwrap();

    let mut files = Vec::new();
    for path in paths {
        let file_name = path.file_name().unwrap().to_str().unwrap().to_string();
        files.push(file_name);
    }


    files
}

#[tauri::command]
fn get_drives() -> Vec<String>{
    let drives = Disks::new_with_refreshed_list();

    let mut disks = Vec::new();
    for drive in &drives {
        disks.push(drive.mount_point().display().to_string());
    }

    disks
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![read_folder_content,get_drives])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
