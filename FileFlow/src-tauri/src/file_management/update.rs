use std::path::PathBuf;

use crate::miscellaneous::gen_available_file_name;



#[tauri::command]
pub async fn rename_item(file_path:String,new_name: String, old_name: String) -> Result<(), String> {
    if new_name == old_name {
        return Ok(());
    }
    let old_file_path = format!("{}/{}", file_path, old_name);
    let new_file_path = gen_available_file_name(PathBuf::from(format!("{}/{}", file_path, new_name))).await;

    let result = std::fs::rename(old_file_path, new_file_path).map_err(|e| e.to_string())?;
    
    Ok(result)
}

#[tauri::command]
pub async fn move_item(old_path:String,new_path:String) -> Result<u64, String> {
    let new_path = gen_available_file_name(PathBuf::from(new_path)).await;
    match PathBuf::from(old_path.clone()).is_file(){
        true => {
            let copyoptions = fs_extra::file::CopyOptions::new().overwrite(true);
            let result = fs_extra::file::move_file(&old_path, &new_path, &copyoptions).map_err(|e| e.to_string())?;
            Ok(result)
        },
        false => {
            let copyoptions = fs_extra::dir::CopyOptions::new();
            std::fs::create_dir(new_path.clone()).map_err(|e| e.to_string())?;
            let result = fs_extra::dir::move_dir(&old_path, &new_path, &copyoptions).map_err(|e| e.to_string())?;
            Ok(result)
        }

    }
}

#[tauri::command]
pub async fn copy_item(old_path:String,new_path:String) -> Result<u64, String> {
    let old_path = PathBuf::from(&old_path);
    let new_path = gen_available_file_name(PathBuf::from(new_path)).await;


    match old_path.is_file() {
        true => {
            let copyoptions = fs_extra::file::CopyOptions::new().overwrite(true);
            let result = fs_extra::file::copy(&old_path, &new_path, &copyoptions).map_err(|e| e.to_string())?;
            Ok(result)
        },
        false => {
            let copyoptions = fs_extra::dir::CopyOptions::new();
            std::fs::create_dir(new_path.clone()).map_err(|e| e.to_string())?;
            let result = fs_extra::dir::copy(&old_path, &new_path, &copyoptions).map_err(|e| e.to_string())?;
            Ok(result)
        }
    }
}