use serde::Serialize;

pub struct ServerConfig {
    pub rendezvous_url: String,
    pub transit_url: String,
}

#[derive(Serialize)]
pub struct fileProgress{
    pub file_name: String,
    pub file_size: u64,
    pub progress: u64,
    pub direction: String
}

