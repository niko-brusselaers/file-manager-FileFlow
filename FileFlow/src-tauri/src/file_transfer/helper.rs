use std::borrow::Cow;

use magic_wormhole::{
    transfer::{AppVersion, APPID},
    transit::{RelayHint, RelayHintParseError},
    AppConfig,
};

use super::types::ServerConfig;

//generate default relay hints
pub fn gen_relay_hints(
    server_config: &ServerConfig,
) -> Result<Vec<RelayHint>, RelayHintParseError> {
    let mut relay_hints: Vec<RelayHint> = Vec::new();

    relay_hints.push(RelayHint::from_urls(
        None,
        server_config.transit_url.parse(),
    )?);

    Ok(relay_hints)
}

pub fn gen_app_config(server_config: &ServerConfig) -> AppConfig<AppVersion> {
    AppConfig {
        id: APPID,
        rendezvous_url: Cow::from(server_config.rendezvous_url.clone()),
        app_version: AppVersion {},
    }
}
