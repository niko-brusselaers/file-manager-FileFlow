use std::path::PathBuf;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug,Clone)]
pub struct File {
    pub name: String,
    pub path: PathBuf,
    pub extension: String,
    pub size: u64,
    pub hidden: bool,
    pub created: String,
    pub modified: String,
}
