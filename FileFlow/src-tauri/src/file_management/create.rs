use std::fs::{create_dir_all, write};
use std::path::PathBuf;

use crate::miscellaneous::gen_available_file_name;

#[tauri::command]
pub async fn create_file(file_path: String, file_name: String) -> Result<(), String> {
    let new_file_name =
        gen_available_file_name(PathBuf::from(format!("{}{}", file_path, file_name))).await;

    let result = write(new_file_name, "").map_err(|e| e.to_string())?;

    Ok(result)
}

#[tauri::command]
pub async fn create_folder(folder_path: String) -> Result<(), String> {
    let result = match create_dir_all(&folder_path) {
        Ok(_) => (),
        Err(e) => return Err(e.to_string()),
    };

    Ok(result)
}

