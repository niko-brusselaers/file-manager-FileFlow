import { useEffect, useState } from "react";
import rustService from "../../services/rustService";
import { IFile } from "../../shared/types/IFile";
import DirectoryItem from "../../shared/components/directoryItem/DirectoryItem";
import styles from './FolderView.module.scss';
import FolderOptionsBar from "../../shared/components/folderOptionsBar/FolderOptionsBar";

function FolderView() {
    const folderTypes = ["folder", "drive","Bin"];
    const [filesAndFolders, setFilesAndFolders] = useState<IFile[]| undefined>();
    const [currentPath, setCurrentPath] = useState<string>("");

  useEffect(() => {
    if(filesAndFolders === undefined){
      
      rustService.getdrives().then((data) => {
        //check if data is undefined
        if(!data?.filesAndFolders && !data?.directoryPath) return;          

        //set files and folders and current path
        setFilesAndFolders(data.filesAndFolders);
        setCurrentPath("My device");
      }).catch((error) => {
        console.error("Error fetching drives:", error);
      });
    }
  });
 
  function getFilesAndFolders(directoryPath: string, pathName:string){
    
    rustService.getFilesAndFolders(directoryPath).then((data) => {
      //check if data is undefined
      if(!data?.filesAndFolders && !data?.directoryPath) return;

      //set files and folders and current path
      setFilesAndFolders(data.filesAndFolders);
      setCurrentPath(pathName);

    }).catch((error) => {
      console.error("Error fetching files and folders:", error);
  
    });
  }
  

  return (
    <div className={styles.directoryView}>
      <FolderOptionsBar/>

      <h2 className={styles.DirectoryName}>{currentPath}</h2>

      <div className={styles.directoryContainer}>
            {filesAndFolders?.map((fileOrFolder,index) => {
              if(folderTypes.includes(fileOrFolder.file_type)){
                return <DirectoryItem handleClick={getFilesAndFolders} item={fileOrFolder} key={index}/>
              } else{
                return <DirectoryItem handleClick={rustService.openFile} item={fileOrFolder} key={index}/>

              }
            })}
      </div>
    </div>
  );
}

export default FolderView;