import { useEffect, useState } from "react";
import rustService from "../../services/rustService";
import { IFile } from "../../shared/types/IFile";
import DirectoryItem from "../../shared/components/directoryItem/DirectoryItem";
import styles from './FolderView.module.scss';
import FolderOptionsBar from "../../shared/components/folderOptionsBar/FolderOptionsBar";
import { useLocation } from "react-router-dom";
import FileTransferSend from "../../shared/components/fileTransfer/fileTransferSendOptions/FileTransferSend";

function FolderView() {
    const folderTypes = ["folder", "drive","Bin"];
    const [filesAndFolders, setFilesAndFolders] = useState<IFile[]| undefined>();
    const loaderData:IFile = useLocation().state;
    const [transferDialogOpen, setTransferDialogOpen] = useState<boolean>(false);
    const [selectedItem, setSelectedItem] = useState<IFile>({file_name:"",file_path:"",file_type:"",file_size:""});

   


    
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
      setSelectedItem({file_name:"",file_path:"",file_type:"",file_size:""});

    }).catch((error) => {
      console.error("Error fetching files and folders:", error);
  
    });
  }

  function handleClick(item:IFile){
        if(selectedItem === item){
          if(item.file_type === "folder" || item.file_type === "drive") getFilesAndFolders(item.file_path);
          else rustService.openFile(item.file_path);
        }else{
          setSelectedItem(item);
        }
    }

  

  return (
    <div className={styles.directoryView}>
      <FileTransferSend dialogOpened={transferDialogOpen} setDialogOpened={setTransferDialogOpen}  selectedItem={selectedItem}/>
      <FolderOptionsBar openTransferDialog={setTransferDialogOpen} selectedItem={selectedItem}/>

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