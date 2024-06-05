import { invoke } from "@tauri-apps/api/core";
import { emit } from "@tauri-apps/api/event";
import { downloadDir } from "@tauri-apps/api/path";

class fileTransfer{

    async sentFiles(filePath:string){
        try {
        await invoke("send_files", {filePath:filePath}).then((res) => {
            emit("FileTransferSuccess", {fileName: res,direction:"send"})
        })
        } catch (error) {
            console.error("Error sending files:", error);
            emit("error", error);
        }
    }

    async downloadFiles(PAKECode:string,downloadDirectory?:string){
        try {
            if(!downloadDirectory) downloadDirectory = await downloadDir();

        await invoke("receive_files", {code:PAKECode, downloadDirectory:downloadDirectory}).then((res) => {
            emit("FileTransferSuccess", {fileName: res,direction:"receive"})
        })
        } catch (error) {
            console.error("Error downloading files:", error);
            emit("error", error);
        }
    }

    async declineRequest(PAKECode:string){
        await invoke("decline_request", {code:PAKECode})   
    }
}

export default new fileTransfer();