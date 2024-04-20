import { useEffect, useState } from "react";
import rustService from "../../services/rustService";
import { IFile } from "../../shared/types/IFile";
import DirectoryItem from "../../shared/components/directoryItem/DirectoryItem";

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
            if(fileOrFolder.file_type === "drive" || fileOrFolder.file_type === "folder"){
              return <DirectoryItem handleClick={getFilesAndFolders} item={fileOrFolder} key={index}/>
            } else{
              return <DirectoryItem handleClick={rustService.openFile} item={fileOrFolder} key={index}/>

            }
          })}
        </ul>
    </div>
  );
}

export default FolderView;