#[tauri::command]
pub fn get_device_name() -> String {
    let device_name = whoami::fallible::hostname().unwrap();
    device_name
}