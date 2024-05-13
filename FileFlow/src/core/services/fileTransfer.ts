import { invoke } from "@tauri-apps/api/core";
import { downloadDir } from "@tauri-apps/api/path";

class fileTransfer{

    async sentFiles(filePath:string){
        try {
        await invoke("send_files", {filePath:filePath}).then((res) => {
            console.log("response:", res);
        })
        } catch (error) {
        console.error("Error sending files:", error);
        }
    }

    async downloadFiles(PAKECode:string,downloadDirectory?:string){
        try {
            if(!downloadDirectory) downloadDirectory = await downloadDir();

        await invoke("receive_files", {code:PAKECode, downloadDirectory:downloadDirectory}).then((res) => {
            console.log("response:", res);
        })
        } catch (error) {
        console.error("Error downloading files:", error);
        }
    }
}

export default new fileTransfer();