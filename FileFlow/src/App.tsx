import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

interface File{
  file_name: string,
  file_path: string
}

function App() {
  const [filesAndFolders, setFilesAndFolders] = useState<File[]| undefined>();
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
        
        setFilesAndFolders(drives.map((drive) => {return {file_name: drive, file_path: drive}}));
      })
      setCurrentPath("");
    } catch (error) {
      console.error("Error fetching drives:", error);
    }
  }

  async function getFilesAndFolders(directoryPath: string) {    
        console.log(directoryPath);
    
    try {
      await invoke("read_directory", { path: directoryPath })
      .then((filesAndFolders) =>  filesAndFolders as File[])
      .then((filesAndFolders) => {
        console.log(filesAndFolders);
        
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
            
            return <button onClick={() => {getFilesAndFolders(fileOrFolder.file_path)}} key={index}>{fileOrFolder.file_name}</button>
          })}
        </ul>
    </div>
  );
}

export default App;
