import { invoke } from "@tauri-apps/api/core";
import { IFile } from "../shared/types/IFile";
import conversion from "./conversion";


class fileManagement {
    
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


                //set file size
                fileOrFolder.file_size = conversion.convertFileSizeIdentifier(parseInt(fileOrFolder.file_size))


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
        let fileOrFolder:IFile = await invoke("check_path", { path: directoryPath })
        return fileOrFolder;
        } catch (error) {
        console.error( error);
        }
    }

    async openFile(directoryPath:string) {
        try {
        await invoke("open_file", { path: directoryPath })
        } catch (error) {
        console.error("Error opening file:", error);
        }
        
    }

    async createFile(filePath:string, fileName:string) {
        try {
        await invoke("create_file", { filePath:filePath, fileName:fileName })
        .catch((error) => {throw error})
        } catch (error) {
        console.error("Error creating file:", error);
        }
    }

    async createFolder(folderPath:String){
        try {
        await invoke("create_folder", { folderPath: folderPath })
        .catch((error) => {throw error})
        } catch (error) {
        console.error("Error creating folder:", error);
        }
    }

    async renameFileOrFolder(filePath:string,oldName:string, newName:string){        
        try {
        await invoke("rename_file_or_folder", { filePath: filePath,oldName:oldName, newName: newName })
        .catch((error) => {throw error})
        } catch (error) {
        console.error("Error renaming file or folder:", error);
        }
    }

    async deleteFileOrFolder(filePath:string){
        try {
        await invoke("delete_file_or_folder", { filePath: filePath })
        .catch((error) => {throw error})
        } catch (error) {
        console.error("Error deleting file or folder:", error);
        }
    }

}

export default new fileManagement();