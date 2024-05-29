import styles from "./ContextMenu.module.scss";
import { listen } from "@tauri-apps/api/event";
import { useEffect, useRef, useState } from "react";
import tauriEmit from "../../../services/tauriEmit";
import { IFile } from "../../types/IFile";
import { IContextMenuData } from "../../types/IContextMenuData";
import { useNavigate } from "react-router-dom";

function ContextMenu() {
    const [pasteItemData, setPasteItemData] = useState<{type:string, items:IFile[]} | null>(sessionStorage.getItem("moveItem") ? JSON.parse(sessionStorage.getItem("moveItem") || '') : null);
    const [active, setActive] = useState<Boolean>(false);
    const [position,setPosition] = useState<{x:number,y:number}>({x:0,y:0})
    const [selectedItems, setSelectedItems] = useState<IFile[]>([]);
    const [createActive, setCreateActive] = useState<Boolean>(true);
    const [copyAndCutActive, setCopyActive] = useState<Boolean>(false);
    const [renameActive, setRenameActive] = useState<Boolean>(false);
    const [deleteActive, setDeleteActive] = useState<Boolean>(false);
    const [fileShareActive, setFileShareActive] = useState<Boolean>(false);
    const [updateFavoriteActive, setUpdateFavoriteActive] = useState<Boolean>(false);
    const [navigateActive, setNavigateActive] = useState<Boolean>(false);
    const [FavouriteAction, setFavouriteAction] = useState<string>("");
    

    const contextMenuRef = useRef<HTMLMenuElement>(null);
    const navigate = useNavigate()


    useEffect(() => {
        listen("updateMoveItem", () => {
            setPasteItemData(sessionStorage.getItem("moveItem") ? JSON.parse(sessionStorage.getItem("moveItem") || '') : null);
        });

        listen("contextMenu", (event) => {
            console.log(event.payload);
            
            if (!(typeof event.payload === 'object') || event.payload === null) return
            let payload = event.payload as IContextMenuData

            //check if the context menu is going to be out of the screen and adjust the position
            if(window.screenX + window.innerWidth < payload.position.x + 200) payload.position.x = payload.position.x - 200;
            if(window.screenY + window.innerHeight < payload.position.y + 200) payload.position.y = payload.position.y - 200;

            setPosition(payload.position)
            setSelectedItems(payload.selectedItems);
            

            switch(payload.contextType){
                case "directoryView":
                    setupFolderViewContextMenu(payload);
                    break;
                case "sideBar":
                    setActive(false)
                    break;
                case "sidebarFavourite":
                    setupFavoriteFolderContextMenu(payload);
                    break;
                case "sideBarFolder":
                    setupFolderContextMenu();
             
                    break;
                default:
                    console.error(`Invalid context type: ${payload.contextType}`);
                    break;
            }
                        
        });
       
        //close the context menu if the user clicks outside of it
        window.addEventListener("click",handleEvent)

        //close the context menu if the user presses the escape key
        window.addEventListener("keydown",handleEvent);

        function handleEvent(event:MouseEvent | KeyboardEvent){
            if(!contextMenuRef.current) return;
            
            if(!contextMenuRef.current.contains(event.target as Node)) {
                setFileShareActive(false)
                setActive(false)
                tauriEmit.emitClearSelection();
                
            };
            
        }

    },[])

    //function to setup the context menu for the folder view
    function setupFolderViewContextMenu(data:IContextMenuData){

        //check if the length of the selected items is 0 and update the context menu accordingly
        if (data.selectedItems.length === 0) {
            setCreateActive(true);
            setCopyActive(false);
            setRenameActive(false);
            setDeleteActive(false);
            setUpdateFavoriteActive(false);
            
        }

        
        //check if the length of the selected items is 1 and update the context menu accordingly
        if (data.selectedItems.length === 1) {
            setCreateActive(false);
            setCopyActive(true);
            setRenameActive(true);
            setDeleteActive(true);
            setFileShareActive(true);    
                            
            setupFavorites(data.selectedItems)
        
        }

        //check if the length of the selected items is more than 1 and update the context menu accordingly
        if (data.selectedItems.length > 1) {
            setCreateActive(false);
            setCopyActive(true);
            setRenameActive(false);
            setDeleteActive(true);
            setFileShareActive(true);

            setupFavorites(data.selectedItems)
        }

        setActive(true);

    }

    //function to setup the context menu for the favorite folder view
    function setupFavoriteFolderContextMenu(data:IContextMenuData){
        setNavigateActive(true);
        setCopyActive(false);
        setCreateActive(false);
        setRenameActive(false);
        setDeleteActive(false);
        setFileShareActive(false);
        setActive(true);

        setupFavorites(data.selectedItems)

        
    }

    //function to setup the context menu for the sidebar
    function setupFolderContextMenu(){
            setNavigateActive(true);
            setCopyActive(false);
            setCreateActive(false);
            setRenameActive(false);
            setDeleteActive(false);
            setFileShareActive(false);
            setActive(true);
    }

    //check if the selected items is a folder and if it is already in the favorites
    function setupFavorites(selectedItems:IFile[]){   
        const allAreFolders = selectedItems.every((item) => item.extension === "folder") && selectedItems.length > 0;            
        
        if(!allAreFolders) return setUpdateFavoriteActive(false);
        
        let favorites = JSON.parse(localStorage.getItem("favoriteFolders") || "[]") as IFile[];
    
        if(favorites.some(favorite => selectedItems.map(item => item.path).includes(favorite.path))) setFavouriteAction("Remove");
        else setFavouriteAction("Add");

        setUpdateFavoriteActive(true);
    }


    function handleCreate(){
        tauriEmit.emitCreateCommand();
        setActive(false);
    }

    function handleCopy(){
        tauriEmit.emitCopyCommand();
        setActive(false);
    };

    function handleCut(){
        tauriEmit.emitCutCommand();
        setActive(false);
    };

    function handlePaste(){
        tauriEmit.emitPasteCommand();
        setActive(false);
    };

    function handleRename(){
        tauriEmit.emitRenameCommand();
        setActive(false);
    };

    function handleDelete(){
        tauriEmit.emitDeleteCommand();
        setActive(false);
    };

    function handleRefresh(){
        window.location.reload();
        setActive(false);
    };

    function handleFileShare(){
        tauriEmit.emitFileShare(selectedItems)
        setActive(false);
    }

    function handleNavigate(event:React.MouseEvent,item:IFile){
        event.preventDefault();
        navigate(`${item.name}`, {state: item})
    };

    //function to add or remove a folder from the favorites
    function handleUpdateFavorite(){
        let favorites = JSON.parse(localStorage.getItem("favoriteFolders") || "[]") as IFile[];
        if(FavouriteAction === "Add") {
            favorites.push(selectedItems[0]);
            favorites = favorites.filter((favorite, index, self) => index === self.findIndex((t) => (t.path === favorite.path)));
        } else if(FavouriteAction === "Remove") {
            favorites = favorites.filter((favorite) => favorite.path !== selectedItems[0].path);
        } else{
            return console.error(`Invalid action: ${FavouriteAction}`);
        }

        localStorage.setItem("favoriteFolders",JSON.stringify(favorites));
        tauriEmit.emitUpdateFavorite();
        setActive(false);
    };



    return ( 
        <menu ref={contextMenuRef} onContextMenu={(event) => {event.preventDefault()}} className={styles.contextMenu} style={ active ? {display:"flex", top:`${position.y}px`, left:`${position.x}px`} : {display:"none"}}>
            <button onClick={handleCreate} 
                    style={(createActive ? {display:"grid"}: {display:"none"})}> 
                        <img src="/dist/create_icon.png"/> 
                        <p>Create</p>
            </button>
            <button onClick={event => handleNavigate(event,selectedItems[0])} 
                    style={(navigateActive ? {display:"grid"}: {display:"none"})}> 
                        <span></span>
                        <p >Open</p>
            </button>
            <button onClick={handleCopy} 
                    style={(copyAndCutActive ? {display:"grid"}: {display:"none"})}> 
                        <img src="/dist/copy_icon.png"/> 
                        <p>Copy</p> 
                        <span>CTRL + C</span>
            </button>
            <button onClick={handleCut} 
                    style={(copyAndCutActive ? {display:"grid"}: {display:"none"})}> 
                    <img src="/dist/cut_icon.png"/> 
                    <p>Cut</p> 
                    <span>CTRL + X</span>
            </button>
            <button onClick={handlePaste} 
                style={(pasteItemData ? {display:"grid"} : {display:"none"})}> 
                    <img src="/dist/paste_icon.png"/> 
                    <p>Paste</p> 
                    <span>CTRL + V</span>
            </button>
            <button onClick={handleFileShare} 
                    style={(fileShareActive ? {display:"grid"} : {display:"none"})}> 
                        <img src="/dist/share_icon.png"/> 
                        <p>Share</p>
            </button>
            <button onClick={handleUpdateFavorite} 
                    style={(updateFavoriteActive ? {display:"grid"} : {display:"none"})}> 
                        <img src="/dist/favorite_icon.svg"/> 
                        <p className={styles.extendText}> {(FavouriteAction === "Remove" ? "Remove from favorites" : "Add to Favorites")}</p>
            </button>
            <button onClick={handleRename} 
                    style={(renameActive ? {display:"grid"} : {display:"none"})}>
                        <img src="/dist/rename_icon.png"/>
                        <p>Rename</p> 
                        <span>F2</span>
                </button>
            <button onClick={handleDelete} 
                    style={(deleteActive ? {display:"grid"} : {display:"none"})}>
                            <img src="/dist/delete_icon.png"/>
                            <p>Delete</p>
                            <span>Del</span>
                </button>
            <button onClick={handleRefresh}>
                        <img src="/dist/refresh_icon.png"/>
                        <p>Refresh</p><span>CTRL + R</span>
            </button>
        </menu> 
    );
}

export default ContextMenu;