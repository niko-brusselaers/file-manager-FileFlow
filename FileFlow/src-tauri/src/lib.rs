use std::{env, ffi::OsStr, fs, path::PathBuf};
use serde::{Serialize, Deserialize};
use sysinfo::Disks;

#[derive(Serialize, Deserialize)]
struct File{
    file_name:String,
    file_path:PathBuf,
    file_type:String
}

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn read_directory(path: String) -> Result<Vec<File>, String> {
    let paths = fs::read_dir(path + "\\")
        .map_err(|e| e.to_string())?;

    let paths = paths
        .map(|res| res.map(|e| File{
            file_name: e.file_name().to_string_lossy().into_owned(),
            file_path: e.path(),
            file_type: e.path().extension().unwrap_or(OsStr::new("folder")).to_string_lossy().into_owned()
        }))
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(paths)
}


#[tauri::command]
fn get_drives() -> Vec<File>{
    let drives = Disks::new_with_refreshed_list();

    let mut disks = Vec::new();
    for drive in &drives {
        let drive = File {
            file_name: drive.name().to_string_lossy().into_owned(),
            file_type: String::from("drive"),
            file_path: drive.mount_point().to_path_buf()
        };
        
        disks.push(drive)
            
    }

    disks
}

#[tauri::command]
fn open_file(path:String) -> Result<(), String>{
    opener::open(String::from(path))
    .map_err(|e| e.to_string())

}


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![read_directory,get_drives,open_file])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
