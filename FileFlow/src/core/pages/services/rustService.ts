import { invoke } from "@tauri-apps/api/core";
import { IFile } from "../../shared/types/IFile";


class rustService{
    
    async getdrives() {
        try {
        let drives = await invoke("get_drives")
        .then((drives) => drives as string[])
        .then((drives) => {
            drives = drives.map((drive) => drive.replace("\\",""))
            
            return drives.map((drive) => {
                let file: IFile = {
                    file_name: drive,
                    file_path: drive,
                    is_file: false
                }

                return file
            })
        })
        return {filesAndFolders: drives, directoryPath: ""}
        } catch (error) {
        console.error("Error fetching drives:", error);
        }
    }

    async getFilesAndFolders(directoryPath: string) {        
        try {
        const filesAndFolders = await invoke("read_directory", { path: directoryPath })
        .then((filesAndFolders) =>  filesAndFolders as IFile[])
        
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