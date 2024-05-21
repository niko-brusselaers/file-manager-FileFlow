import styles from './FolderOptionsBar.module.scss';
import { IFile } from '../../types/IFile';
import { emit, listen } from '@tauri-apps/api/event';
import { useEffect, useState } from 'react';
import tauriEmit from '../../../services/tauriEmit';

function FolderOptionsBar({selectedItems,createItem,editItem}: { selectedItems: IFile[],createItem:Function,editItem:Function}){
    const [pasteItemData, setPasteItemData] = useState<{type:string, items:IFile[]} | null>(sessionStorage.getItem("moveItem") ? JSON.parse(sessionStorage.getItem("moveItem") || '') : null);

    useEffect(() => {
        listen("clearedMoveItem", () => {
            setPasteItemData(null);
        });
    },[])

    function openTransferSend(){
        if(selectedItems.some(selectedItem => selectedItem.file_name != "")) emit("sendFile", {file: selectedItems});
        else return;
    }

    function copyItems(){
        
        if(!selectedItems.length) return;
        // Set the moveItem in the session storage when there is a selectedItem
        tauriEmit.emitCopyCommand();
        sessionStorage.setItem("moveItem", JSON.stringify({type:"copy", items:selectedItems}))
        setPasteItemData({type:"copy", items:selectedItems})
        
    };

    function cutItems(){
        if(!selectedItems.length) return;
        // Set the moveItem in the session storage when there is a selectedItem
        tauriEmit.emitCutCommand();
        sessionStorage.setItem("moveItem", JSON.stringify({type:"cut", items:selectedItems}))
        setPasteItemData({type:"cut", items:selectedItems})
    }

    function pasteItems(){
        tauriEmit.emitPasteCommand();
        setPasteItemData(sessionStorage.getItem("moveItem") ? JSON.parse(sessionStorage.getItem("moveItem") || '') : null);
    };

    function deleteItems(){
        tauriEmit.emitDeleteCommand();
    }

    
    return (
        <div className={styles.folderOptionsBar}>
            <div className={styles.folderOptionsBarButtonGroup}>
                <button className={styles.folderOptionsBarButton} onClick={tauriEmit.emitCreateCommand}>
                <img src="/create_icon.png" alt="create file" />
                </button>
                <button className={`${styles.folderOptionsBarButton} ${(selectedItems.some(selectedItem => selectedItem.file_name != "") ? "": styles.inactive)}`} onClick={cutItems}>
                    <img src="/cut_icon.png" alt="cut file" />
                </button>
                <button className={`${styles.folderOptionsBarButton} ${(selectedItems.some(selectedItem => selectedItem.file_name != "") ? "": styles.inactive)}`} onClick={copyItems}>
                    <img src="/copy_icon.png" alt="copy file" />
                </button>
                <button className={`${styles.folderOptionsBarButton} ${(pasteItemData ? "": styles.inactive)}`} onClick={pasteItems}>
                    <img src="/paste_icon.svg" alt="paste file" />
                </button>
                <button className={`${styles.folderOptionsBarButton} ${(selectedItems.some(selectedItem => selectedItem.file_name != "") ? "": styles.inactive)}`} onClick={() => {deleteItems()}}>
                    <img src="/delete_icon.png" alt="delete file" />
                </button>
                <button className={`${styles.folderOptionsBarButton} ${(selectedItems.some(selectedItem => selectedItem.file_name != "") ? "": styles.inactive)}`}>
                    <img src="/rename_icon.png" alt="rename file"  onClick={tauriEmit.emitRenameCommand}/>
                </button>
            </div>
            <div className={styles.folderOptionsBarButtonGroup}>
                <button className={styles.folderOptionsBarButton}>
                    <img src="/sort_icon.png" alt="create file" />
                </button>
                <button className={styles.folderOptionsBarButton}>
                    <img src="/showHidden_icon.png" alt="create file" />
                </button>
                <button className={styles.folderOptionsBarButton}>
                    <img src="/folderView_icon.png" alt="create file" />
                </button>
            </div>
            <div className={styles.folderOptionsBarButtonGroup}>
                <button className={`${styles.folderOptionsBarButton} ${selectedItems.length ? " " : styles.inactive}`} onClick={() => {openTransferSend()}}>
                    <img src="/share_icon.png" alt="create file" />
                </button>
                <button className={styles.folderOptionsBarButton}>
                    <img src="/zip_icon.png" alt="create file" />
                </button>
                <button className={styles.folderOptionsBarButton}>
                    <img src="/unzip_icon.png" alt="create file" />
                </button>
                <button className={styles.folderOptionsBarButton}>
                    <img src="/convert_icon.png" alt="create file" />
                </button>
            </div>
               
        </div>
    );
}

export default FolderOptionsBar;