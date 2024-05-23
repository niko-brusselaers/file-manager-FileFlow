use super::types::File;
use std::{ffi::OsStr,fs, os::windows::fs::MetadataExt, path::PathBuf, time::SystemTime};
use sysinfo::Disks;
use winapi::um::winnt::FILE_ATTRIBUTE_HIDDEN;

#[tauri::command]
pub fn read_directory(path: String,is_hidden:bool) -> Result<Vec<File>, String> {
    let paths = fs::read_dir(path).map_err(|e| e.to_string())?;

    let paths = paths
        .map(|res| {
            res.map(|entry| {

                let metadata = entry.metadata().unwrap();
                let hidden = if cfg!(target_os = "windows") {
                    metadata.file_attributes() & FILE_ATTRIBUTE_HIDDEN != 0
                } else {
                    entry.file_name().to_str().map(|s| s.starts_with(".")).unwrap_or(false)
                };


                File {
                    name: entry.file_name().to_string_lossy().into_owned(),
                    path: entry.path(),
                    size: metadata.file_size(),
                    created: metadata.created().unwrap(),
                    modified: metadata.modified().unwrap(),
                    hidden,
                    extension: entry
                        .path()
                        .extension()
                        .unwrap_or(OsStr::new("folder"))
                        .to_string_lossy()
                        .into_owned(),
            }
            })
        })
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    let paths = paths.into_iter().filter(|file| file.hidden == is_hidden).collect();

    Ok(paths)
}

#[tauri::command]
pub fn get_drives() -> Vec<File> {
    let drives = Disks::new_with_refreshed_list();

    let mut disks = Vec::new();
    for drive in &drives {
        let drive = File {
            name: drive.name().to_string_lossy().into_owned(),
            extension: String::from("drive"),
            created: SystemTime::now(),
            modified: SystemTime::now(),
            hidden: false,
            path: drive.mount_point().to_path_buf(),
            size: drive.total_space(),
        };

        disks.push(drive)
    }

    disks
}

#[tauri::command]
pub fn check_path(path: String) -> Result<File, String> {
    let file_path = std::path::Path::new(&path);

    let metadata= file_path.metadata().map_err(|error| error.to_string())?;

    let name = file_path
        .file_name()
        .unwrap_or(OsStr::new(&path))
        .to_string_lossy()
        .to_string();

    let extension = file_path
        .extension()
        .unwrap_or(OsStr::new("folder"))
        .to_string_lossy()
        .into_owned();

    let hidden = if cfg!(target_os = "windows") {
                    metadata.file_attributes() & FILE_ATTRIBUTE_HIDDEN != 0
                } else {
                    file_path.file_name().unwrap().to_str().map(|s| s.starts_with(".")).unwrap_or(false)
                };

    let file = File {
        name,
        extension,
        path: PathBuf::from(file_path),
        size: metadata.len(),
        created: metadata.created().unwrap(),
        modified: metadata.modified().unwrap(),
        hidden
    };

    Ok(file)
}

#[tauri::command]
pub fn open_file(path: String) -> Result<(), String> {
    opener::open(String::from(path)).map_err(|e| e.to_string())
}
