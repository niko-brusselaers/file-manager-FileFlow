

#[tauri::command]
pub async fn rename_file_or_folder(file_path:String,new_name: String, old_name: String) -> Result<(), String> {
    if new_name == old_name {
        return Ok(());
    }

    let old_file_path = format!("{}/{}", file_path, old_name);
    let new_file_path = format!("{}/{}", file_path, new_name);

    let result = std::fs::rename(old_file_path, new_file_path).map_err(|e| e.to_string())?;

    Ok(result)
}