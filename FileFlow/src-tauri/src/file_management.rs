use serde::{Deserialize, Serialize};
use std::{ffi::OsStr, fs, path::PathBuf};
use sysinfo::Disks;

#[derive(Serialize, Deserialize)]
pub struct File {
    file_name: String,
    file_path: PathBuf,
    file_type: String,
    file_size: u64
}

#[tauri::command]
pub fn read_directory(path: String) -> Result<Vec<File>, String> {
    let paths = fs::read_dir(path + "\\").map_err(|e| e.to_string())?;

    let paths = paths
        .map(|res| {
            res.map(|entry| File {
                file_name: entry.file_name().to_string_lossy().into_owned(),
                file_path: entry.path(),
                file_size: entry.metadata().unwrap().len(),
                file_type: entry
                            .path()
                            .extension()
                            .unwrap_or(OsStr::new("folder"))
                            .to_string_lossy()
                            .into_owned(),
            })
        })
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(paths)
}

#[tauri::command]
pub fn get_drives() -> Vec<File> {
    let drives = Disks::new_with_refreshed_list();

    let mut disks = Vec::new();
    for drive in &drives {
        let drive = File {
            file_name: drive.name().to_string_lossy().into_owned(),
            file_type: String::from("drive"),
            file_path: drive.mount_point().to_path_buf(),
            file_size: drive.total_space()
        };

        disks.push(drive)
    }

    disks
}

#[tauri::command]
pub fn open_file(path: String) -> Result<(), String> {
    opener::open(String::from(path)).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn check_path(path: String) -> Result<String, String> {
    let check = std::path::Path::new(&path).metadata().map_err(|e| e.to_string())?;
    let is_dir = check.is_dir();
    let is_file = check.is_file();

    if is_dir {
    Ok(String::from("Folder"))
    } else if is_file {
        Ok(String::from("File"))
    } else {
        Err(String::from("Path is neither a file nor a directory"))
    }
}
