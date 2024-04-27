import { invoke } from "@tauri-apps/api/core";
import { IFile } from "../shared/types/IFile";


class rustService{
    
    async getdrives() {
        try {
        let drives:IFile[] = await invoke("get_drives")
        
        drives = drives.map((drive:IFile) => {
            drive.file_path = drive.file_path.replace("\\\\", "\\")
            drive.file_name = (drive.file_name ? drive.file_name : "Drive") + ` (${drive.file_path.replace("\\","")})`
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
            fileOrFolder.file_path = fileOrFolder.file_path.replace("\\\\", "\\")
            return fileOrFolder
        })

        
        return {filesAndFolders, directoryPath}

        } catch (error) {
        //display error
        console.error("Error fetching files and folders:", error);
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
}

export default new rustService();