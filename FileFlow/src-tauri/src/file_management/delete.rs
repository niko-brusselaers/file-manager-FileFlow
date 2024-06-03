use std::path::PathBuf;

use async_std::{fs::{remove_dir_all, remove_file}};

#[tauri::command]
pub async fn delete_item(file_path: String) -> Result<(), String> {
    let file_pathbuf = PathBuf::from(file_path);

    if file_pathbuf.is_dir() {
        delete_directory(file_pathbuf).await?;
    } else if file_pathbuf.is_file() {
        delete_file(file_pathbuf).await?;
    } else if file_pathbuf.is_symlink(){
        delete_file(file_pathbuf).await?;
    } else {
        return Err("Path is not a file or folder".to_string());
    }
      
    Ok(())
    
}

async fn delete_directory(directory_path:PathBuf) -> Result<(), String>{
    match remove_dir_all(directory_path).await {
            Ok(_) => (),
            Err(e) => return Err(e.to_string()),
    };
    
    Ok(())
}

async fn delete_file(file_path:PathBuf) -> Result<(), String>{
    match remove_file(file_path).await {
            Ok(_) => (),
            Err(e) => return Err(e.to_string()),
    };

    Ok(())

}
