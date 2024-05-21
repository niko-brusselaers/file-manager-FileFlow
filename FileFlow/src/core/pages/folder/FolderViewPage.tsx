import React, { useEffect, useRef, useState } from "react";
import { IFile } from "../../shared/types/IFile";
import DirectoryItem from "../../shared/components/directoryItem/DirectoryItem";
import styles from './FolderView.module.scss';
import FolderOptionsBar from "../../shared/components/folderOptionsBar/FolderOptionsBar";
import { useLocation, useNavigate } from "react-router-dom";
import fileManagement from "../../services/fileManagement";
import ContextMenu from "../../shared/components/contextMenu/ContextMenu";
import { Menu } from "@tauri-apps/api/menu";
import { listen } from "@tauri-apps/api/event";
import tauriEmit from "../../services/tauriEmit";

function FolderView() {
  // const folderTypes = ["folder", "drive", "Bin"];
  const [filesAndFolders, setFilesAndFolders] = useState<IFile[]>(() => []);
  const filesAndFoldersRef = useRef(filesAndFolders);
  filesAndFoldersRef.current = filesAndFolders;
  const loaderData: IFile = useLocation().state;
  const navigate = useNavigate();
  const [selectedItems, setSelectedItems] = useState<IFile[]>(() => [])
  const selectedItemsRef = useRef(selectedItems);
  selectedItemsRef.current = selectedItems;

  const [MenuContext,setMenuContext] = useState<Menu>();

  
  
  useEffect(() => {
    //create a context menu for the folder view
    ContextMenu.getFolderViewContextMenu().then((menu) => setMenuContext(menu))

    //listen for create new file command and create a new file
    listen("createNewFile", () => createNewFile());
    
    //listen for the copy command and copy the selected items
    listen("copy", () => copyItems());

    //listen for the cut command and cut the selected items
    listen("cut", () => cutItems());

    //listen for the paste command and paste the copied or cut items
    listen("paste", () => pasteItems());

    //listen for the rename command and rename the selected item
    listen("rename",()=> renameFileOrFolder())

    //listen for the delete command and delete the selected items
    listen("delete",async() => deleteItems())

    //listen for keydown events
    window.addEventListener("keydown", (event) => {
      if (event.ctrlKey && event.key === "c") return copyItems();
      if (event.ctrlKey && event.key === "x") return cutItems();
      if (event.ctrlKey && event.key === "v") return pasteItems();
      if (event.key === "F2") return renameFileOrFolder();
      if (event.key === "Delete") return deleteItems();
    });
    
  },[])



  //fetch the files and folders in the directory
  function getFilesAndFolders(directoryPath: string){
    fileManagement.getDirectoryItems(directoryPath).then((data) => {
      if (!data?.filesAndFolders && !data?.directoryPath) return;
      setFilesAndFolders(data.filesAndFolders);
      setSelectedItems([]);
    }).catch((error) => {
      console.error("Error fetching files and folders:", error);
    });    
  };

  //add selected item to the selectedItems array, if the item is already in the array open the file or folder
  function setSelected(event:React.MouseEvent,item: IFile) {
    
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

  //unselect all items when user clicks on the directory view
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

  //create a new file
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
  

  //rename the selected file or folder
  function renameFileOrFolder(){
    let renameItem = selectedItemsRef.current[0];
    if (renameItem.file_name === "") return;
    const updatedFilesAndFolders = filesAndFoldersRef.current.map((fileOrFolder) => {
      if (fileOrFolder.file_name === renameItem.file_name) fileOrFolder.edit = true;      
      return fileOrFolder;});
      
    setFilesAndFolders(updatedFilesAndFolders);
  }

  //cut the selected items
  function cutItems(){
    let cutItems = selectedItemsRef.current;    
    if(!cutItems.length) return;
    sessionStorage.setItem("moveItem", JSON.stringify({type:"cut", items:cutItems}))
    tauriEmit.emitUpdateMoveitem();
  }

  //copy the selected items
  function copyItems(){
    let copyItems = selectedItemsRef.current;
    if(!copyItems.length) return;
    sessionStorage.setItem("moveItem", JSON.stringify({type:"copy", items:copyItems}))
    tauriEmit.emitUpdateMoveitem();
  }

  //paste the copied or cut items
  function pasteItems(){
    //retrieve the moveItem from the session storage
    let moveItem:{type:string, items:IFile[]} | null = sessionStorage.getItem("moveItem") ? JSON.parse(sessionStorage.getItem("moveItem") || '') : null;

    //if there is no moveItem return
    if(!moveItem) return;
    switch (moveItem.type) {
        // when the moveItem is a copy, copy the items
        case "copy":
            moveItem.items.map(item => {
                let copyPath = loaderData.file_path + "\\" + item.file_name
                fileManagement.copyItem(item.file_path,copyPath)
            })
            break;
        // when the moveItem is a cut, move the items
        case "cut":
            moveItem.items.map(item => {
                let copyPath = loaderData.file_path + "\\" + item.file_name
                fileManagement.moveItem(item.file_path,copyPath)
            })
            sessionStorage.removeItem("moveItem")
            tauriEmit.emitUpdateMoveitem();
            break;
        default:
            break;
    }
  }

  //delete the selected items
  function deleteItems(){
    if (!selectedItemsRef.current.some(selectedItem => selectedItem.file_name != "")) return;          
    selectedItemsRef.current.map(selectedItem => fileManagement.deleteItem(selectedItem .file_path))
  };

  //fetch the files and folders when navigating to a new directory
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
    <div onContextMenu={ async ()=> {MenuContext?.popup()}} className={styles.directoryView} onClick={(event) => unSelectItems(event)}>
      <FolderOptionsBar selectedItems={selectedItems}/>

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
