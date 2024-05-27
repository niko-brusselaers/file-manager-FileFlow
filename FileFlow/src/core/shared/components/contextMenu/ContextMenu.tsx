import styles from "./ContextMenu.module.scss";
import { listen } from "@tauri-apps/api/event";
import { useEffect, useRef, useState } from "react";
import tauriEmit from "../../../services/tauriEmit";
import { IFile } from "../../types/IFile";

function ContextMenu() {
    const [pasteItemData, setPasteItemData] = useState<{type:string, items:IFile[]} | null>(sessionStorage.getItem("moveItem") ? JSON.parse(sessionStorage.getItem("moveItem") || '') : null);
    const [active, setActive] = useState<Boolean>(false);
    const [position,setPosition] = useState<{x:number,y:number}>({x:0,y:0})

    const contextMenuRef = useRef<HTMLMenuElement>(null);


    useEffect(() => {
        console.log(pasteItemData ? "" : styles.hidden);
        listen("updateMoveItem", () => {
            setPasteItemData(sessionStorage.getItem("moveItem") ? JSON.parse(sessionStorage.getItem("moveItem") || '') : null);
        });

        listen("contextMenu", (event) => {
            if (!(typeof event.payload === 'object') || event.payload === null) return
            let payload = event.payload as {
                selectedItems: IFile[],
                position:{
                    x:number, 
                    y:number
                }
            }

            //check if the context menu is going to be out of the screen and adjust the position
            if(window.screenX + window.innerWidth < payload.position.x + 200) payload.position.x = payload.position.x - 200;
            if(window.screenY + window.innerHeight < payload.position.y + 200) payload.position.y = payload.position.y - 200;

            setPosition(payload.position)
            setActive(true);
            
        });

        //close the context menu if the user clicks outside of it
        window.addEventListener("click",(event) => {
            if(!contextMenuRef.current) return;
            
            if(!contextMenuRef.current.contains(event.target as Node)) return setActive(false);
        })

        //close the context menu if the user presses the escape key
        window.addEventListener("keydown",(event) => {
            if(event.key === "Escape") setActive(false);
        });

    },[])

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



    return ( 
        <menu ref={contextMenuRef} onContextMenu={(event) => {event.preventDefault()}} className={styles.contextMenu} style={ active ? {display:"flex", top:`${position.y}px`, left:`${position.x}px`} : {display:"none"}}>
            <button onClick={handleCreate}> <img src="/dist/create_icon.png"/> <p>Create</p></button>
            <button onClick={handleCopy}> <img src="/dist/copy_icon.png"/> <p>Copy</p> <span>CTRL + C</span></button>
            <button onClick={handleCut}> <img src="/dist/cut_icon.png"/> <p>Cut</p> <span>CTRL + X</span></button>
            <button onClick={handlePaste} style={(pasteItemData ? {display:"grid"} : {display:"none"})}> <img src="/dist/paste_icon.svg"/> <p>Paste</p> <span>CTRL + V</span></button>
            <button onClick={handleRename}><img src="/dist/rename_icon.png"/><p>Rename</p> <span>F2</span></button>
            <button onClick={handleDelete}><img src="/dist/delete_icon.png"/><p>Delete</p><span>Del</span></button>
            <button onClick={handleRefresh}><img src="/dist/refresh_icon.svg"/><p>Refresh</p><span>CTRL + R</span></button>
        </menu> 
    );
}

export default ContextMenu;