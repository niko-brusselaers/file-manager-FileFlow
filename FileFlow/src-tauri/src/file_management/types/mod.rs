use std::path::PathBuf;

use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct File {
    pub file_name: String,
    pub file_path: PathBuf,
    pub file_type: String,
    pub file_size: u64,
}
