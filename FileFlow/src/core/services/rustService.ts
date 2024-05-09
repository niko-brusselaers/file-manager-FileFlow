import { invoke } from "@tauri-apps/api/core";
import { IFile } from "../shared/types/IFile";
import { downloadDir } from "@tauri-apps/api/path";


class rustService{
    
    async getdrives() {
        try {
        let drives:IFile[] = await invoke("get_drives")
        
        //remove double backslashes
        drives = drives.map((drive:IFile) => {
            drive.file_path = drive.file_path.replace("\\\\", "\\")
            //set drive name
            drive.file_name = (drive.file_name ? drive.file_name : "Drive") + ` (${drive.file_path.replace("\\","")})`

            let fileSize = parseInt(drive.file_size)
            //convert file size to readable format
            if(fileSize/Math.pow(1024, 4) > 1) drive.file_size = ((fileSize/Math.pow(1024, 4)).toFixed(2)).toString() +" TB";
            else if(fileSize/Math.pow(1024, 3) > 1) drive.file_size = ((fileSize/Math.pow(1024, 3)).toFixed(2)) + " GB";
            else if(fileSize/Math.pow(1024, 2) > 1) drive.file_size = ((fileSize/Math.pow(1024, 2)).toFixed(2))  +" MB";
            else if(fileSize/1024 > 1) drive.file_size = ((fileSize/1024).toFixed(2))+ " KB";
            else drive.file_size = fileSize + " B";
            return drive
            
        })

        return {filesAndFolders: drives, directoryPath: ""}
        } catch (error) {
        console.error("Error fetching drives:", error);
        }
    }

    async getFilesAndFolders(directoryPath: string) {        
        try {

        let filesAndFolders:IFile[] = await invoke("read_directory", { path: directoryPath })
    
        filesAndFolders = filesAndFolders.map((fileOrFolder:IFile) => {
            //remove double backslashes
            fileOrFolder.file_path = fileOrFolder.file_path.replace("\\\\", "\\")


            let fileSize = parseInt(fileOrFolder.file_size)
            //convert file size to readable format
            if(fileSize/Math.pow(1024, 4) > 1) fileOrFolder.file_size = ((fileSize/Math.pow(1024, 4)).toFixed(2)).toString() +" TB";
            else if(fileSize/Math.pow(1024, 3) > 1) fileOrFolder.file_size = ((fileSize/Math.pow(1024, 3)).toFixed(2)) + " GB";
            else if(fileSize/Math.pow(1024, 2) > 1) fileOrFolder.file_size = ((fileSize/Math.pow(1024, 2)).toFixed(2))  +" MB";
            else if(fileSize/1024 > 1) fileOrFolder.file_size = ((fileSize/1024).toFixed(2))+ " KB";
            else fileOrFolder.file_size = fileSize + " B";


            return fileOrFolder
        })

        
        return {filesAndFolders, directoryPath}

        } catch (error) {
        //display error
        console.error("Error fetching files and folders:", error);
        }
    }

    async checkPathIsValid(directoryPath:string){
        try {
        let isValid:string = await invoke("check_path", { path: directoryPath })
        return isValid;
        } catch (error) {
        console.error( error);
        }
    }

    async openFile(directoryPath:string) {
        console.log("Opening file:", directoryPath);
        try {
        await invoke("open_file", { path: directoryPath })
        } catch (error) {
        console.error("Error opening file:", error);
        }
        
    }

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

export default new rustService();