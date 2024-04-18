import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

interface File{
  file_name: string,
  file_path: string,
  is_file: boolean
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
        
        setFilesAndFolders(drives.map((drive) => {return {file_name: drive, file_path: drive, is_file:false}}));
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

  async function openFile(directoryPath:string) {
    console.log("Opening file:", directoryPath);
    try {
      await invoke("open_file", { path: directoryPath })
    } catch (error) {
      console.error("Error opening file:", error);
    }
    
  }

  return (
    <div>
        <ul>
          {filesAndFolders?.map((fileOrFolder,index) => {
            if(fileOrFolder.is_file){
              return <button onClick={() => {openFile(fileOrFolder.file_path)}} key={index}>{fileOrFolder.file_name}</button>

            } else{
              return <button onClick={() => {getFilesAndFolders(fileOrFolder.file_path)}} key={index}>{fileOrFolder.file_name}</button>
            }
          })}
        </ul>
    </div>
  );
}

export default App;
