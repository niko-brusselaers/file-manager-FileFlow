import { useEffect, useState } from "react";
import rustService from "../../services/rustService";
import { IFile } from "../../shared/types/IFile";
import DirectoryItem from "../../shared/components/directoryItem/DirectoryItem";
import styles from './FolderView.module.scss';
import FolderOptionsBar from "../../shared/components/folderOptionsBar/FolderOptionsBar";
import { useLocation } from "react-router-dom";

function FolderView() {
    const folderTypes = ["folder", "drive","Bin"];
    const [filesAndFolders, setFilesAndFolders] = useState<IFile[]| undefined>();
    const loaderData:IFile = useLocation().state;

    
useEffect(() => {
    
    if(loaderData === null){

      rustService.getdrives().then((data) => {
        
        //check if data is undefined
        if(!data?.filesAndFolders && !data?.directoryPath) return;          

        //set files and folders and current path
        setFilesAndFolders(data.filesAndFolders);
      }).catch((error) => {
        console.error("Error fetching drives:", error);
      });
    } else{
      getFilesAndFolders(loaderData.file_path);
    }
  },[loaderData]);
 
  function getFilesAndFolders(directoryPath: string){
    
    rustService.getFilesAndFolders(directoryPath).then((data) => {
      //check if data is undefined
      if(!data?.filesAndFolders && !data?.directoryPath) return;

      //set files and folders and current path
      setFilesAndFolders(data.filesAndFolders);

    }).catch((error) => {
      console.error("Error fetching files and folders:", error);
  
    });
  }

  

  return (
    <div className={styles.directoryView}>
      <FolderOptionsBar/>

      <h2 className={styles.directoryName}>{(loaderData ? loaderData.file_name : "My device")}</h2>

      <div className={styles.directoryContainer}>
            {filesAndFolders?.map((fileOrFolder,index) => {
              if(folderTypes.includes(fileOrFolder.file_type)){
                return <DirectoryItem  item={fileOrFolder} isDirectory={true} key={index}/>
              } else{
                return <DirectoryItem  item={fileOrFolder} key={index}/>

              }
            })}
      </div>
    </div>
  );
}

export default FolderView;