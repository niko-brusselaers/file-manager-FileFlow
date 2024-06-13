import React, { useEffect, useRef, useState } from "react";
import { IFile } from "../../shared/types/IFile";
import styles from './FolderView.module.scss';
import FolderOptionsBar from "../../shared/components/folderOptionsBar/FolderOptionsBar";
import { useLocation, useNavigate } from "react-router-dom";
import fileManagement from "../../services/fileManagement";
import { listen } from "@tauri-apps/api/event";
import tauriEmit from "../../services/tauriEmit";
import conversion from "../../services/conversion";
import DirectoryItemTile from "../../shared/components/directoryItem/directoryItemTile/DirectoryItemTile";
import DirectoryItemDetail from "../../shared/components/directoryItem/directoryItemDetail/DirectoryItemDetail";
import ContainerDetailViewTop from "../../shared/components/containerDetailViewTop/ContainerDetailViewTop";
import { IContextMenuData } from "../../shared/types/IContextMenuData";

function FolderView() {
  const [sortingConfig, setSortingConfig] = useState<{sortBy:string, order:string}>(localStorage.getItem("sortBy") && localStorage.getItem("order") ? {sortBy:localStorage.getItem("sortBy") || "", order:localStorage.getItem("order") || ""} : {sortBy:"name", order:"ascending"});
  const [filesAndFolders, setFilesAndFolders] = useState<IFile[]>(() => []);
  const [currentFilesAndFolders, setCurrentFilesAndFolders] = useState<IFile[]>(() => [])
  const [selectedItems, setSelectedItems] = useState<IFile[]>(() => [])
  const [hidden, setHidden] = useState<Boolean>(localStorage.getItem("hiddenFiles") ? JSON.parse(localStorage.getItem("hiddenFiles") || '') : false);
  const [detailView, setDetailView] = useState<Boolean>(localStorage.getItem("detailView") ? JSON.parse(localStorage.getItem("detailView") || '') : false);

  const loaderData: IFile = useLocation().state;
  const navigate = useNavigate();

  const loaderDataRef = useRef(loaderData);
  loaderDataRef.current = loaderData;
  const filesAndFoldersRef = useRef(filesAndFolders);
  filesAndFoldersRef.current = filesAndFolders;
  const selectedItemsRef = useRef(selectedItems);
  selectedItemsRef.current = selectedItems;

  
  useEffect(() => {     
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
    listen("delete",() => deleteItems())

    //listen for the fs-change event and fetch the files and folders
    listen("fs-change", () => getFilesAndFolders(loaderDataRef.current?.path))

    //listen for search command and search for the files and folders
    listen("searchDirectory", (event) => {
      let searchQuery = event.payload as string;
      let filteredItems = filesAndFoldersRef.current.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
      setCurrentFilesAndFolders(filteredItems);
    })

    //listen for hidden files command and change the state of the hidden files
    listen("hiddenFiles",(event) => {
      setHidden(event.payload as boolean)
      getFilesAndFolders(loaderData?.path)
    })

    //listen for detail view command and change the state of the detail view
    listen("changeViewType", (event) => {setDetailView(event.payload as boolean)})

    //listen for sort files command and sort the files
    listen("sortFiles", (event) => {
      setSortingConfig(event.payload as {sortBy:string, order:string})
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
        sortItems(data.filesAndFolders);        
      }).catch((error) => {
        console.error("Error fetching drives:", error);
      });
    } else {
      //get currently watched directory and unwatch it, then watch the new directory
      let watchedDirectory = sessionStorage.getItem("watchedDirectory") ? sessionStorage.getItem("watchedDirectory") || '' : null;
      if(watchedDirectory) fileManagement.unWatchDirectory(watchedDirectory).then(()=> fileManagement.watchDirectory(loaderDataRef.current.path));
      else fileManagement.watchDirectory(loaderData.path);
      
      getFilesAndFolders(loaderData.path);
    }

  }, [loaderData]);

  useEffect(() => {sortItems()}, [sortingConfig,filesAndFolders])
  useEffect(() => getFilesAndFolders(loaderDataRef.current?.path), [hidden])

  //fetch the files and folders in the directory
  function getFilesAndFolders(directoryPath: string){ 
    //get hidden state from the local storage  
    if(loaderData?.path === "" || !loaderData) return;
    //fetch the files and folders in the directory
    fileManagement.getDirectoryItems(directoryPath, hidden).then((data) => {      
      if (!data?.filesAndFolders && !data?.directoryPath) return;
      setFilesAndFolders(data.filesAndFolders);
      sortItems(data.filesAndFolders);
      setSelectedItems([]);
    }).catch((error) => {
      console.error("Error fetching files and folders:", error);
    });    
  };

  //add selected item to the selectedItems array, if the item is already in the array open the file or folder
  function setSelected(event:React.MouseEvent,item: IFile) {    
    
    if(event.type === "auxclick" && selectedItems.length > 0) return;
    if(selectedItems.length === 0) return setSelectedItems([item]);

    selectedItems.map(selectedItem => {
      //if selected item is already in the selectedItems array open the file or folder
      if (selectedItem === item) {
        let name = item.name.split("(")[0]
        if (item.extension === "folder" || item.extension === "drive")return navigate(`/${name}`, { state: item });
        else return fileManagement.openFile(item.path);

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

  //sort the files and folders based on the sorting configuration
  async function sortItems(fileOrFolders:IFile[] = filesAndFoldersRef.current){
    let sortedItems = [...fileOrFolders];
    switch(sortingConfig.sortBy){
      case "name":        
        sortedItems.sort((a,b) => a.name.localeCompare(b.name));
        break;
      case "type":
        sortedItems.sort((a,b) => a.extension.localeCompare(b.extension));
        break;
      case "size":
        sortedItems.sort((a,b) => conversion.convertFileSizeToNumber(a.size) - conversion.convertFileSizeToNumber(b.size));
        break;
      case "updated":
        sortedItems.sort((a,b) => new Date(a.modified).getTime() - new Date(b.modified).getTime());
    }

    if(sortingConfig.order === "descending") sortedItems.reverse();

    setCurrentFilesAndFolders(sortedItems);
}

  //create a new file
  async function createNewFile(){


    //format created and modified date
    let createdDate = new Date().toISOString();;
    createdDate = `${createdDate.slice(2,10).split('-').reverse().join('/')}` + ' - ' + `${createdDate.slice(11,16)}`;

    let modifiedDate = new Date().toISOString();;
    modifiedDate = `${modifiedDate.slice(2,10).split('-').reverse().join('/')}` + ' - ' + `${modifiedDate.slice(11,16)}`;



    const newFile: IFile = {
      name: "newFile",
      path: loaderData.path,
      created: createdDate,
      modified: modifiedDate,
      hidden: false,
      extension: "",
      size: "",
      edit: true,
    };
    setFilesAndFolders((prevFilesAndFolders) => [newFile, ...prevFilesAndFolders]);
    setCurrentFilesAndFolders((prevFilesAndFolders) => [newFile, ...prevFilesAndFolders]);
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
                let copyPath = loaderDataRef.current.path + "\\" + item.name
                fileManagement.copyItem(item.path,copyPath)
            })
            break;
        // when the moveItem is a cut, move the items
        case "cut":
            moveItem.items.map(item => {
                let copyPath = loaderDataRef.current.path + "\\" + item.name
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

  function handleContextMenu(event:React.MouseEvent<HTMLDivElement, MouseEvent>){
    event.preventDefault();
    let data:IContextMenuData = {
        selectedItems: selectedItemsRef.current,
        position:{
            x:event.clientX, 
            y:event.clientY
        },
        contextType : "directoryView"
      }

    tauriEmit.emitContextMenuOpen(data)
  }

  return (
    <div onContextMenu={handleContextMenu} className={styles.directoryView} onClick={(event) => unSelectItems(event)}>
      <FolderOptionsBar selectedItems={selectedItems}/>

      <h2 className={styles.directoryName}>
        {loaderData ? loaderData.name : "My device"}
      </h2>

      <div className={detailView ? styles.directoryContainerDetail : styles.directoryContainerTile}>
        {(detailView ? <ContainerDetailViewTop/> : "")}
        {currentFilesAndFolders.map((fileOrFolder, index) => (
          detailView ? 
          <DirectoryItemDetail
            item={fileOrFolder}
            edit={fileOrFolder.edit}
            setSelected={setSelected}
            selectedItems={selectedItems}
            key={index}/> 
          : 
          <DirectoryItemTile
            item={fileOrFolder}
            edit={fileOrFolder.edit}
            setSelected={setSelected}
            selectedItems={selectedItems}
            key={index}/>
          
        ))}
      </div>
    </div>
  );
}

export default FolderView;
