use std::net::SocketAddr;
use futures::future::BoxFuture;
use futures::FutureExt;
use magic_wormhole::transit::TransitInfo;
use async_std::sync::{Arc, Condvar, Mutex};

pub fn transit_handler (info: TransitInfo, addr: SocketAddr) {
        println!("Transit info: {:?}", info);
        println!("Socket address: {:?}", addr);
    }

pub fn progress_handler (current: u64, total: u64) {
    // println!("Progress: {} out of {}", current, total);
}

pub fn cancel<'a>() -> BoxFuture<'a, ()> {
    let notifier = Arc::new((Mutex::new(false), Condvar::new()));
    return async move {
        let (lock, cvar) = &*notifier;
        let mut started = lock.lock().await;
        while !*started {
            started = cvar.wait(started).await;
        }
    }
    .boxed();
}