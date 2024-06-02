import React, { useEffect, useState } from "react";
import { IFile } from "../../shared/types/IFile";
import styles from './SearchPage.module.scss';
import DirectoryItemDetail from "../../shared/components/directoryItem/directoryItemDetail/DirectoryItemDetail";
import ContainerDetailViewTop from "../../shared/components/containerDetailViewTop/ContainerDetailViewTop";
import fileManagement from "../../services/fileManagement";
import { useLocation, useNavigate } from "react-router-dom";

function SearchPage() {
    const navigate = useNavigate();
    const searchQuery: string = useLocation().state;

    const [filesAndFolders, setFilesAndFolders] = useState<IFile[]>([]);
    const [selectedItem, setSelectedItems] = useState<IFile>();
    const [statusMessage, setStatusMessage] = useState<string>(`Searching for ${searchQuery}`);

    useEffect(() => {
        fileManagement.searchDevice(searchQuery).then((response) => {
            if(response) setFilesAndFolders(response)
            else setStatusMessage(`No files or folders found for ${searchQuery}`)
        });

        
    }, [searchQuery]);
    
  //add selected item to the selectedItems array, if the item is already in the array open the file or folder
  function handleSelection(event:React.MouseEvent,item: IFile) {
    event.preventDefault();
    if(selectedItem?.name == "") return setSelectedItems(item);
    
    if(selectedItem?.extension != "folder") {
      const parentFolderPath = item.path.replace(`\\${item.name}`,"");
      fileManagement.checkPathIsValid(parentFolderPath).then((response) => {
        navigate(`/${response?.name}`, {state: response});
      });
      
    } else {
      fileManagement.checkPathIsValid(item.path).then((response) => {
        navigate(`/${response?.name}`, {state: response});
      });
    }
    
  };

    //unselect all items when user clicks on the directory view
  function unSelectItems(event:React.MouseEvent){      
      const selectableTargets= [
        document.querySelector(`.${styles.directoryName}`),
        document.querySelector(`.${styles.directoryContainer}`),
        document.querySelector(`.${styles.directoryView}`)
      ]

    if(selectableTargets.some(target => target === event.target))setSelectedItems({} as IFile);

      
  }

  return (
    <div className={styles.SearchView} onClick={(event) => unSelectItems(event)}>
         <h2 className={styles.SearchQuery}>{searchQuery}</h2>
      <div className={styles.directoryContainerDetail}>
        <ContainerDetailViewTop/>
        { filesAndFolders ? filesAndFolders.map((item,index) => 
        <DirectoryItemDetail
            item={item}
            edit={item.edit}
            setSelected={handleSelection}
            selectedItems={selectedItem ? [selectedItem] : []}
            key={index}/> ) : <h1>{statusMessage}</h1>}
      </div>
    </div>
  );
}

export default SearchPage;
