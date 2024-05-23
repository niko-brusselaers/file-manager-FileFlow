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
  const [selectedItems, setSelectedItems] = useState<IFile[]>(() => [])
  const [MenuContext,setMenuContext] = useState<Menu>();
  const [hidden, setHidden] = useState<Boolean>(true);


  const filesAndFoldersRef = useRef(filesAndFolders);
  filesAndFoldersRef.current = filesAndFolders;
  const selectedItemsRef = useRef(selectedItems);
  selectedItemsRef.current = selectedItems;

  const loaderData: IFile = useLocation().state;
  const navigate = useNavigate();


  
  
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

    //listen for hidden files command and change the state of the hidden files
    listen("hiddenFiles",(event) => {
      setHidden(event.payload as boolean)
      getFilesAndFolders(loaderData?.path)
    })

    //listen for keydown events
    window.addEventListener("keydown", (event) => {
      if (event.ctrlKey && event.key === "c") return copyItems();
      if (event.ctrlKey && event.key === "x") return cutItems();
      if (event.ctrlKey && event.key === "v") return pasteItems();
      if (event.key === "F2") return renameFileOrFolder();
      if (event.key === "Delete") return deleteItems();
    });    
    
  },[])


    //fetch the files and folders when navigating to a new directory
  useEffect(() => {
    if (loaderData === null || loaderData.name === "My Device") {
      //fetch the drives when the loaderData is null or the name is "My Device"
      fileManagement.getdrives().then((data) => {
        if (!data?.filesAndFolders && !data?.directoryPath) return;        
        setFilesAndFolders(data.filesAndFolders);
      }).catch((error) => {
        console.error("Error fetching drives:", error);
      });
    } else {
      getFilesAndFolders(loaderData.path);      
    }
  }, [loaderData]);

  useEffect(() => getFilesAndFolders(loaderData?.path), [hidden])

  //fetch the files and folders in the directory
  function getFilesAndFolders(directoryPath: string){ 
    //get hidden state from the local storage
    setHidden(localStorage.getItem("hiddenFiles") ? JSON.parse(localStorage.getItem("hiddenFiles") || '') : false)  
    fileManagement.getDirectoryItems(directoryPath, hidden).then((data) => {      
      if (!data?.filesAndFolders && !data?.directoryPath) return;
      setFilesAndFolders(data.filesAndFolders)
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
        
        if (item.extension === "folder" || item.extension === "drive") {
          return navigate(`/${item.name}`, { state: item });
        } else {
          return fileManagement.openFile(item.path);
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
      name: "newFile",
      path: loaderData.path,
      created: new Date(),
      modified: new Date(),
      hidden: false,
      extension: "",
      size: "",
      edit: true,
    };
    setFilesAndFolders((prevFilesAndFolders) => [newFile, ...prevFilesAndFolders]);
    setSelectedItems([newFile]);
  };
  

  //rename the selected file or folder
  function renameFileOrFolder(){
    let renameItem = selectedItemsRef.current[0];
    if (renameItem.name === "") return;
    const updatedFilesAndFolders = filesAndFoldersRef.current.map((fileOrFolder) => {
      if (fileOrFolder.name === renameItem.name) fileOrFolder.edit = true;      
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
                let copyPath = loaderData.path + "\\" + item.name
                fileManagement.copyItem(item.path,copyPath)
            })
            break;
        // when the moveItem is a cut, move the items
        case "cut":
            moveItem.items.map(item => {
                let copyPath = loaderData.path + "\\" + item.name
                fileManagement.moveItem(item.path,copyPath)
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
    if (!selectedItemsRef.current.some(selectedItem => selectedItem.name != "")) return;          
    selectedItemsRef.current.map(selectedItem => fileManagement.deleteItem(selectedItem .path))
  };

  return (
    <div onContextMenu={ async ()=> {MenuContext?.popup()}} className={styles.directoryView} onClick={(event) => unSelectItems(event)}>
      <FolderOptionsBar selectedItems={selectedItems}/>

      <h2 className={styles.directoryName}>
        {loaderData ? loaderData.name : "My device"}
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
