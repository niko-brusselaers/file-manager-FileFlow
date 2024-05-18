use std::path::PathBuf;

use crate::miscellaneous::gen_available_file_name;



#[tauri::command]
pub async fn rename_item(file_path:String,new_name: String, old_name: String) -> Result<(), String> {
    if new_name == old_name {
        return Ok(());
    }

    let old_file_path = format!("{}/{}", file_path, old_name);
    let new_file_path = format!("{}/{}", file_path, new_name);

    let result = std::fs::rename(old_file_path, new_file_path).map_err(|e| e.to_string())?;
    
    Ok(result)
}

#[tauri::command]
pub async fn move_item(old_path:String,new_path:String) -> Result<(), String> {
    let new_path = gen_available_file_name(PathBuf::from(new_path)).await;
    let result = std::fs::rename(old_path, new_path).map_err(|e| e.to_string())?;
  Ok(result)
}

#[tauri::command]
pub async fn copy_item(old_path:String,new_path:String) -> Result<u64, String> {
    let new_path = gen_available_file_name(PathBuf::from(new_path)).await;
    let result = std::fs::copy(old_path, new_path).map_err(|e| e.to_string())?;
  Ok(result)
}