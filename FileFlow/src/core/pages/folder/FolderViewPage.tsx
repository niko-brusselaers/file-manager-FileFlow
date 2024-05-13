import { useEffect, useState } from "react";
import { IFile } from "../../shared/types/IFile";
import DirectoryItem from "../../shared/components/directoryItem/DirectoryItem";
import styles from './FolderView.module.scss';
import FolderOptionsBar from "../../shared/components/folderOptionsBar/FolderOptionsBar";
import { useLocation, useNavigate } from "react-router-dom";
import fileManagement from "../../services/fileManagement";


function FolderView() {
    const folderTypes = ["folder", "drive","Bin"];
    const [filesAndFolders, setFilesAndFolders] = useState<IFile[]| undefined>();
    const loaderData:IFile = useLocation().state;
    const navigate = useNavigate()

    const [selectedItem, setSelectedItem] = useState<IFile>({file_name:"",file_path:"",file_type:"",file_size:""});

   


    
useEffect(() => { 
      
    if(loaderData === null){

      fileManagement.getdrives().then((data) => {        
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
    
    fileManagement.getFilesAndFolders(directoryPath).then((data) => {
      //check if data is undefined
      if(!data?.filesAndFolders && !data?.directoryPath) return;

      //set files and folders and current path
      setFilesAndFolders(data.filesAndFolders);
      setSelectedItem({file_name:"",file_path:"",file_type:"",file_size:""});

    }).catch((error) => {
      console.error("Error fetching files and folders:", error);
  
    });
  }

  function handleClick(item:IFile){
        if(selectedItem === item){
          if(item.file_type === "folder" || item.file_type === "drive") navigate(`/${item.file_name}`, {state: item});
          else fileManagement.openFile(item.file_path);
        }else{
          setSelectedItem(item);
        }
    }

  

  return (
    <div className={styles.directoryView}>
      <FolderOptionsBar selectedItem={selectedItem}/>

      <h2 className={styles.directoryName}>{(loaderData ? loaderData.file_name : "My device")}</h2>

      <div className={styles.directoryContainer}>
            {filesAndFolders?.map((fileOrFolder,index) => {
              if(folderTypes.includes(fileOrFolder.file_type)){
                return <DirectoryItem  item={fileOrFolder} handleClick={handleClick}  selectedItem={selectedItem} key={index}/>
              } else{
                return <DirectoryItem  item={fileOrFolder} handleClick={handleClick} selectedItem={selectedItem} key={index}/>

              }
            })}
      </div>
    </div>
  );
}

export default FolderView;