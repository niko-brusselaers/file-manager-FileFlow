import { useEffect, useState } from "react";
import rustService from "../services/rustService";
import { IFile } from "../../shared/types/IFile";

function FolderView() {
    const [filesAndFolders, setFilesAndFolders] = useState<IFile[]| undefined>();
    const [currentPath, setCurrentPath] = useState<string>("");

  useEffect(() => {
    if(filesAndFolders === undefined){
      rustService.getdrives().then((data) => {
        //check if data is undefined
        if(!data?.filesAndFolders && !data?.directoryPath) return;

        //set files and folders and current path
        setFilesAndFolders(data.filesAndFolders);
        setCurrentPath(data.directoryPath);
      }).catch((error) => {
        console.error("Error fetching drives:", error);
      });
    }
  });
 
  function getFilesAndFolders(directoryPath: string){
    rustService.getFilesAndFolders(directoryPath).then((data) => {
      //check if data is undefined
      if(!data?.filesAndFolders && !data?.directoryPath) return;

      //set files and folders and current path
      setFilesAndFolders(data.filesAndFolders);
      setCurrentPath(data.directoryPath);

    }).catch((error) => {
      console.error("Error fetching files and folders:", error);
  
    });
  }
  

  return (
    <div>
        <ul>
          {filesAndFolders?.map((fileOrFolder,index) => {
            if(fileOrFolder.is_file){
              return <button onClick={() => {rustService.openFile(fileOrFolder.file_path)}} key={index}>{fileOrFolder.file_name}</button>

            } else{
              return <button onClick={() => {getFilesAndFolders(fileOrFolder.file_path)}} key={index}>{fileOrFolder.file_name}</button>
            }
          })}
        </ul>
    </div>
  );
}

export default FolderView;