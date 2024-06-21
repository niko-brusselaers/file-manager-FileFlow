use std::fs::{create_dir_all,write};
use std::path::PathBuf;

use crate::miscellaneous::gen_available_file_name;

#[tauri::command]
pub async fn create_file(file_path: String, file_name: String) -> Result<(), String> {
    let new_file_name =
        gen_available_file_name(PathBuf::from(format!("{}{}", file_path, file_name))).await;

    let result = std::fs::File::create(new_file_name).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn create_folder(folder_path: String) -> Result<(), String> {
    println!("Creating folder: {}", folder_path);
    let new_folder_name =
        gen_available_file_name(PathBuf::from(format!("{}{}", folder_path, ""))).await;
    let result = match create_dir_all(&new_folder_name) {
        Ok(_) => (),
        Err(e) => return Err(e.to_string()),
    };

    Ok(result)
}
