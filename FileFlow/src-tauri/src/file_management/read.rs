use super::types::File;
use std::os::windows::fs::MetadataExt;
use std::{ffi::OsStr,fs, path::PathBuf};
use rust_search::SearchBuilder;
use sysinfo::Disks;
use chrono::DateTime;
use chrono::offset::Utc;
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

                 // Convert SystemTime to DateTime
                let created: DateTime<Utc> = metadata.created().unwrap().into();
                let modified: DateTime<Utc> = metadata.modified().unwrap().into();

                // Convert DateTime to a string in RFC 3339 format
                let created = created.to_rfc3339();
                let modified = modified.to_rfc3339();

                File {
                    name: entry.file_name().to_string_lossy().into_owned(),
                    path: entry.path(),
                    size: metadata.len(),
                    created,
                    modified,
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

        //if is_hidden is false, filter out hidden files else return all files
        let paths = if is_hidden {
            paths
        } else {
            paths.into_iter().filter(|file| !file.hidden).collect()
        };
        
        Ok(paths)
    }

#[tauri::command]
pub fn get_drives() -> Result<Vec<File>,String> {
    let drives = Disks::new_with_refreshed_list();

    

    let mut disks = Vec::new();
    for drive in &drives {

        let modified: DateTime<Utc> = Utc::now();
        let created: DateTime<Utc> = Utc::now();


        let created = created.to_rfc3339();
        let modified = modified.to_rfc3339();

        let drive = File {
            name: drive.name().to_string_lossy().into_owned(),
            extension: String::from("drive"),
            created,
            modified,
            hidden: false,
            path: drive.mount_point().to_path_buf(),
            size: drive.total_space(),
        };

        disks.push(drive)
    }

    Ok(disks)
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


    // Convert SystemTime to DateTime
    let created: DateTime<Utc> = metadata.created().unwrap().into();
    let modified: DateTime<Utc> = metadata.modified().unwrap().into();

    let hidden = if cfg!(target_os = "windows") {
                metadata.file_attributes() & FILE_ATTRIBUTE_HIDDEN != 0
            } else {
                file_path.file_name().unwrap().to_str().map(|s| s.starts_with(".")).unwrap_or(false)
            };

    // Convert DateTime to a string in RFC 3339 format
    let created = created.to_rfc3339();
    let modified = modified.to_rfc3339();

    let file = File {
        name,
        extension,
        path: PathBuf::from(file_path),
        size: metadata.len(),
        created,
        modified,
        hidden
    };

    Ok(file)
}

#[tauri::command]
pub fn open_file(path: String) -> Result<(), String> {
    opener::open(String::from(path)).map_err(|e| e.to_string())
}
use std::thread;
use std::sync::mpsc;
#[tauri::command]
pub fn search_device(query: &str) -> Result<Vec<File>,String> {
    let drives = get_drives().map_err(|error| error.to_string())?;

    let drive_paths = drives.iter().map(|drive| drive.path.to_str().unwrap().to_string()).collect::<Vec<String>>();

    let (tx, rx) = mpsc::channel();

    let query = query.to_owned();

    thread::spawn(move || -> Result<(), String> {
        let search = SearchBuilder::default()
            .search_input(&query)
            .more_locations(drive_paths)
            .ignore_case()
            .build();

        let mut files: Vec<File> = Vec::new();

        for result in search {
            let path_buf = PathBuf::from(result);
            let metadata = path_buf.metadata().map_err(|error| error.to_string())?;

            let name = path_buf
                .file_name()
                .unwrap_or(OsStr::new("unkown"))
                .to_string_lossy()
                .to_string();

            let extension = path_buf.extension().unwrap_or(OsStr::new("folder")).to_string_lossy().into_owned();

            // Convert SystemTime to DateTime
            let created: DateTime<Utc> = metadata.created().unwrap().into();
            let modified: DateTime<Utc> = metadata.modified().unwrap().into();

            // Convert DateTime to a string in RFC 3339 format
            let created = created.to_rfc3339();
            let modified = modified.to_rfc3339();

            let hidden = if cfg!(target_os = "windows") {
                metadata.file_attributes() & FILE_ATTRIBUTE_HIDDEN != 0
            } else {
                path_buf.file_name().unwrap().to_str().map(|s| s.starts_with(".")).unwrap_or(false)
            };

            let file = File {
                name,
                extension,
                path: path_buf,
                size: metadata.len(),
                created,
                modified,
                hidden
            };

            files.push(file);
        }

        tx.send(files).map_err(|_| "Error sending data from thread".to_string())
    });

    let files = rx.recv().map_err(|_| "Error receiving data from thread".to_string())?;

    Ok(files)
}