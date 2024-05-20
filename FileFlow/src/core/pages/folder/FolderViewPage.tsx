import React, { useEffect, useState } from "react";
import { IFile } from "../../shared/types/IFile";
import DirectoryItem from "../../shared/components/directoryItem/DirectoryItem";
import styles from './FolderView.module.scss';
import FolderOptionsBar from "../../shared/components/folderOptionsBar/FolderOptionsBar";
import { useLocation, useNavigate } from "react-router-dom";
import fileManagement from "../../services/fileManagement";

function FolderView() {
  // const folderTypes = ["folder", "drive", "Bin"];
  const [filesAndFolders, setFilesAndFolders] = useState<IFile[]>([]);
  const loaderData: IFile = useLocation().state;
  const navigate = useNavigate();
  const [selectedItems, setSelectedItems] = useState<IFile[]>([])

  

  function getFilesAndFolders(directoryPath: string){
    fileManagement.getDirectoryItems(directoryPath).then((data) => {
      if (!data?.filesAndFolders && !data?.directoryPath) return;
      setFilesAndFolders(data.filesAndFolders);
      setSelectedItems([]);
    }).catch((error) => {
      console.error("Error fetching files and folders:", error);
    });    
  };

  const setSelected = (event:React.MouseEvent,item: IFile) => {
    
    if(selectedItems.length === 0) return setSelectedItems([item]);
    selectedItems.map(selectedItem => {
      
      //if selected item is already in the selectedItems array open the file or folder
      if (selectedItem === item) {
        
        if (item.file_type === "folder" || item.file_type === "drive") {
          return navigate(`/${item.file_name}`, { state: item });
        } else {
          return fileManagement.openFile(item.file_path);
        }
      } else {
        //if selected item is not in the selectedItems array add it to the array
        if(event.ctrlKey || event.shiftKey) return setSelectedItems([...selectedItems, item]);
        else return setSelectedItems([item]);
      }
    })
    
  };

  function unSelectItems(event:React.MouseEvent){      
      const selectableTargets= [
        document.querySelector(`.${styles.directoryName}`),
        document.querySelector(`.${styles.directoryContainer}`),
        document.querySelector(`.${styles.directoryView}`)
      ]
      
      // if user clicks anything other than a directory item, unselect all items
      // and ctrl and shift keys are not pressed, unselect all items
      if(event.ctrlKey) return;
      if(event.shiftKey) return;
      if(selectableTargets.some(target => target === event.target))setSelectedItems([]);
      
  }

  async function createNewFile(){
    const newFile: IFile = {
      file_name: "newFile",
      file_path: loaderData.file_path,
      file_type: "",
      file_size: "",
      edit: true,
    };
    setFilesAndFolders((prevFilesAndFolders) => [newFile, ...prevFilesAndFolders]);
    setSelectedItems([newFile]);
  };

  function deleteFileOrFolder(){
    if (!selectedItems.some(selectedItem => selectedItem.file_name != "")) return;
    selectedItems.forEach((selectedItem) => fileManagement.deleteItem(selectedItem.file_path));
  }; 

  function renameFileOrFolder(selectedItem: IFile){
    if (!selectedItem.file_name) return;
    const updatedFilesAndFolders = filesAndFolders.map((fileOrFolder) => {
      if (fileOrFolder.file_name === selectedItem.file_name) fileOrFolder.edit = true;
      return fileOrFolder;});
    setFilesAndFolders(updatedFilesAndFolders);
  }


  useEffect(() => {
    if (loaderData === null || loaderData.file_name === "My Device") {
      fileManagement.getdrives().then((data) => {
        if (!data?.filesAndFolders && !data?.directoryPath) return;
        setFilesAndFolders(data.filesAndFolders);
      }).catch((error) => {
        console.error("Error fetching drives:", error);
      });
    } else {
      getFilesAndFolders(loaderData.file_path);
    }
  }, [loaderData]);

  return (
    <div className={styles.directoryView} onClick={(event) => unSelectItems(event)}>
      <FolderOptionsBar selectedItems={selectedItems} currentPath={loaderData ? loaderData.file_path : ""} deleteItems={deleteFileOrFolder} createItem={createNewFile} editItem={renameFileOrFolder} />

      <h2 className={styles.directoryName}>
        {loaderData ? loaderData.file_name : "My device"}
      </h2>

      <div className={styles.directoryContainer}>
        {filesAndFolders.map((fileOrFolder, index) => (
          <DirectoryItem
            item={fileOrFolder}
            edit={fileOrFolder.edit}
            setSelected={setSelected}
            selectedItems={selectedItems}
            key={index}
          />
        ))}
      </div>
    </div>
  );
}

export default FolderView;
