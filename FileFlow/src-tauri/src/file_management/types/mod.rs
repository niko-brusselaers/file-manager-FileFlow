use std::{path::PathBuf, time::SystemTime};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct File {
    pub name: String,
    pub path: PathBuf,
    pub extension: String,
    pub size: u64,
    pub hidden: bool,
    pub created: SystemTime,
    pub modified: SystemTime,
}
