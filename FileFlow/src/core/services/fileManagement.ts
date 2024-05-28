import { invoke } from "@tauri-apps/api/core";
import { IFile } from "../shared/types/IFile";
import conversion from "./conversion";


class fileManagement {
    
    async getdrives() {
        try {
        let drives:IFile[] = await invoke("get_drives")
        
        //remove double backslashes
        drives = drives.map((drive:IFile) => {
            drive.path = drive.path.replace("\\\\", "\\")
            //set drive name
            drive.name = (drive.name ? drive.name : "Drive") + ` (${drive.path.replace("\\","")})`

            //format created and modified date
            drive.created = new Date(drive.created).toLocaleString()
            drive.modified = new Date(drive.modified).toLocaleString()

            let fileSize = parseInt(drive.size)
            //convert file size to readable format
            if(fileSize/Math.pow(1024, 4) > 1) drive.size = ((fileSize/Math.pow(1024, 4)).toFixed(2)).toString() +" TB";
            else if(fileSize/Math.pow(1024, 3) > 1) drive.size = ((fileSize/Math.pow(1024, 3)).toFixed(2)) + " GB";
            else if(fileSize/Math.pow(1024, 2) > 1) drive.size = ((fileSize/Math.pow(1024, 2)).toFixed(2))  +" MB";
            else if(fileSize/1024 > 1) drive.size = ((fileSize/1024).toFixed(2))+ " KB";
            else drive.size = fileSize + " B";
            return drive
            
        })

        return {filesAndFolders: drives, directoryPath: ""}
        } catch (error) {
        console.error("Error fetching drives:", error);
        }
    }

    async getDirectoryItems(directoryPath: string,isHidden?:Boolean) {        
        try {

            let filesAndFolders:IFile[] = await invoke("read_directory", { path: directoryPath, isHidden: isHidden ? isHidden : false})
        
            filesAndFolders = filesAndFolders.map((fileOrFolder:IFile) => {
                
                //remove double backslashes
                fileOrFolder.path = fileOrFolder.path.replace("\\\\", "\\")
                                
                //format created and modified date
                fileOrFolder.created = new Date(fileOrFolder.created).toLocaleString()
                fileOrFolder.modified = new Date(fileOrFolder.modified).toLocaleString()
                
                //set file size
                fileOrFolder.size = conversion.convertFileSizeIdentifier(parseInt(fileOrFolder.size))


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

    async renameItem(filePath:string,oldName:string, newName:string){        
        try {
        await invoke("rename_item", { filePath: filePath,oldName:oldName, newName: newName })
        .catch((error) => {throw error})
        } catch (error) {
        console.error("Error renaming file or folder:", error);
        }
    }

    async copyItem(filePath:string,destinationPath:string){
        try {
        await invoke("copy_item", { oldPath: filePath, newPath: destinationPath })
        .catch((error) => {throw error})
        } catch (error) {
        console.error("Error copying file or folder:", error);
        }
    }

    async moveItem(filePath:string,destinationPath:string){
        try {
        await invoke("move_item", { oldPath: filePath, newPath: destinationPath })
        .catch((error) => {throw error})
        } catch (error) {
        console.error("Error moving file or folder:", error);
        }
    }

    async deleteItem(filePath:string){
        try {
        await invoke("delete_item", { filePath: filePath })
        .catch((error) => {throw error})
        } catch (error) {
        console.error("Error deleting file or folder:", error);
        }
    }

    async watchDirectory(directoryPath:string){
        try {
            console.log();
            
            sessionStorage.setItem("watchedDirectory", directoryPath)            
            await invoke("watch_directory", { path: directoryPath })
            .catch((error) => {throw error})

        } catch (error) {
            console.error("Error watching directory:", error);
        }
    }

    async unWatchDirectory(directoryPath:string){
        try {
            console.log("unwatching directory");
            
        await invoke("unwatch_directory", { path: directoryPath })
        .catch((error) => {throw error})
        } catch (error) {
        console.error("Error stopping watching directory:", error);
        }
    }

    async searchDevice(query:string){
        try {
            let searchItems = await invoke("search_device", { query: query })
            .then((response) => response as IFile[])
            .catch((error) => {throw error})

            searchItems = searchItems.map((fileOrFolder:IFile) => {
                //remove double backslashes
                fileOrFolder.path = fileOrFolder.path.replace("\\\\", "\\")
                                
                //format created and modified date
                fileOrFolder.created = new Date(fileOrFolder.created).toLocaleString()
                fileOrFolder.modified = new Date(fileOrFolder.modified).toLocaleString()

                //set file size
                fileOrFolder.size = conversion.convertFileSizeIdentifier(parseInt(fileOrFolder.size))
                return fileOrFolder})

            return searchItems
            
        } catch (error) {
            console.error("Error searching device:", error);
        }
    }

}

export default new fileManagement();