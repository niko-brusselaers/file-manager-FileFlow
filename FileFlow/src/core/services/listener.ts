import { listen } from "@tauri-apps/api/event";
import { Store } from "@tauri-apps/plugin-store";

class listener{
    store = new Store("fileTransfers");

    async storeOngoingFileTransfers(){
        listen("file_transfer", async (data) => {
            console.log("file transfer event", data);
            
        })
    }
}

export default new listener();