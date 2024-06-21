use std::{ffi::OsStr, path::PathBuf};

#[tauri::command]
pub fn get_device_name() -> String {
    let device_name = whoami::fallible::hostname().unwrap();
    device_name
}

pub async fn gen_available_file_name(file_path: PathBuf) -> String {
    let new_file_path = if std::env::consts::OS == "windows" {
        file_path.to_str().unwrap().replace("/", "\\")
    } else {
        file_path.to_str().unwrap().replace("\\", "/")
    };


    if PathBuf::from(&new_file_path).exists() {
        let mut file_name = file_path.file_stem().unwrap().to_str().unwrap().to_string();
        let file_extension = match file_path.is_dir() {
            true => String::from("folder"),
            false => file_path
                .extension()
                .unwrap_or(OsStr::new("file"))
                .to_string_lossy()
                .into_owned(),
        };
        let parent_path = file_path.parent().unwrap().to_str().unwrap().to_string();

        let mut i = 1;

        //check if file is already a copy and set i to the copy number
        if file_name.contains("(") && file_name.contains(")") {
            let file_name_parts: Vec<&str> = file_name.split("(").collect();
            let new_file_name = file_name_parts[0];
            let file_name_parts: Vec<&str> = file_name_parts[1].split(")").collect();
            i = file_name_parts[0].parse::<i32>().unwrap();
            file_name = new_file_name.to_string();
        }

        //loop until a unique file name is generated
        loop {
            let new_file_name = match file_extension == "folder" {
                true => format!("{}({})", file_name, i),
                false => format!("{}({}){}", file_name, i, file_extension),
            };

            let path_separator = if std::env::consts::OS == "windows" {
                "\\"
            } else {
                "/"
            };

            let new_file_path = format!("{}{}{}", parent_path, path_separator, new_file_name);

            if !PathBuf::from(&new_file_path).exists() {
                return new_file_path;
            }

            i += 1;
        }
    } else {
        new_file_path
    }
}

#[tauri::command]
pub fn get_os_type() -> String {
    let os = std::env::consts::OS;

    String::from(os)
}
