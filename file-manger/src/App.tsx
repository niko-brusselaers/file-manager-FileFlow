import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import "./App.css";
import { path } from "@tauri-apps/api";

function App() {
  const [filesAndFolders, setFilesAndFolders] = useState<string[]| undefined>();
  const [currentPath, setCurrentPath] = useState<string>("");

  useEffect(() => {
    if(filesAndFolders === undefined){
      getdrives()
    }
  });
 
  async function getdrives() {
    try {
      await invoke("get_drives")
      .then((drives) => drives as string[])
      .then((drives) => {
        drives = drives.map((drive) => drive.replace("\\",""))
        setFilesAndFolders(drives)
      })
      setCurrentPath("");
    } catch (error) {
      console.error("Error fetching drives:", error);
    }
  }

  async function getFilesAndFolders(directoryPath: string) {
    console.log("directoryPath:", directoryPath);
    
    try {
      await invoke("read_folder_content", { path: directoryPath })
      .then((filesAndFolders) =>  filesAndFolders as string[])
      .then((filesAndFolders) => {
        // set the files and folders available in the current directory
        setFilesAndFolders(filesAndFolders);
        //set the current path
        setCurrentPath(directoryPath);
        
      });

    } catch (error) {
      //display error
      console.error("Error fetching files and folders:", error);
    }
  }

  return (
    <div>
        <ul>
          {filesAndFolders?.map((fileOrFolder,index) => {
            let absolutePath = ""
            if (currentPath === "") {
              absolutePath = fileOrFolder+"\\";
            } else {
              absolutePath = currentPath +"\\"+ fileOrFolder;
            }
            return <button onClick={() => {getFilesAndFolders(absolutePath)}} key={index}>{fileOrFolder.replace(currentPath!,"")}</button>
          })}
        </ul>
    </div>
  );
}

export default App;
