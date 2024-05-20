import styles from './FolderOptionsBar.module.scss';
import { IFile } from '../../types/IFile';
import { emit } from '@tauri-apps/api/event';
import fileManagement from '../../../services/fileManagement';
import { useState } from 'react';

function FolderOptionsBar({selectedItems,currentPath,deleteItems,createItem,editItem}: { selectedItems: IFile[],currentPath:string,createItem:Function,deleteItems:Function,editItem:Function}){
    const [pasteItemData, setPasteItemData] = useState<{type:string, items:IFile[]} | null>(sessionStorage.getItem("moveItem") ? JSON.parse(sessionStorage.getItem("moveItem") || '') : null);

    

    function openTransferSend(){
        if(selectedItems.some(selectedItem => selectedItem.file_name != "")) emit("sendFile", {file: selectedItems});
        else return;
    }

    function moveItem(type:string){
        
        if(!selectedItems.length) return;
        // Set the moveItem in the session storage when there is a selectedItem
        sessionStorage.setItem("moveItem", JSON.stringify({type:type, items:selectedItems}))
        setPasteItemData({type:type, items:selectedItems})
        
    };

    function pasteItem(){
        let moveItem:{type:string, items:IFile[]} | null = sessionStorage.getItem("moveItem") ? JSON.parse(sessionStorage.getItem("moveItem") || '') : null;
        console.log(moveItem);
        
        if(!moveItem) return;
        // Execute the copy or cut operation when there is a moveItem but no selectedItem
        switch (moveItem.type) {
            case "copy":
                moveItem.items.map(item => {
                    let copyPath = currentPath + "\\" + item.file_name
                    fileManagement.copyItem(item.file_path,copyPath)
                })
                break;
            case "cut":
                moveItem.items.map(item => {
                    let copyPath = currentPath + "\\" + item.file_name
                    fileManagement.copyItem(item.file_path,copyPath)
                })
                sessionStorage.removeItem("moveItem")
                setPasteItemData(null)
                break;
            default:
                break;
        }
    };
    
    return (
        <div className={styles.folderOptionsBar}>
            <div className={styles.folderOptionsBarButtonGroup}>
                <button className={styles.folderOptionsBarButton} onClick={() => {createItem()}}>
                <img src="/create_icon.png" alt="create file" />
                </button>
                <button className={`${styles.folderOptionsBarButton} ${(selectedItems.some(selectedItem => selectedItem.file_name != "") ? "": styles.inactive)}`} onClick={() => moveItem("cut")}>
                    <img src="/cut_icon.png" alt="cut file" />
                </button>
                <button className={`${styles.folderOptionsBarButton} ${(selectedItems.some(selectedItem => selectedItem.file_name != "") ? "": styles.inactive)}`} onClick={()=> moveItem("copy")}>
                    <img src="/copy_icon.png" alt="copy file" />
                </button>
                <button className={`${styles.folderOptionsBarButton} ${(pasteItemData ? "": styles.inactive)}`} onClick={()=> pasteItem()}>
                    <img src="/paste_icon.svg" alt="paste file" />
                </button>
                <button className={`${styles.folderOptionsBarButton} ${(selectedItems.some(selectedItem => selectedItem.file_name != "") ? "": styles.inactive)}`} onClick={() => {deleteItems()}}>
                    <img src="/delete_icon.png" alt="delete file" />
                </button>
                <button className={`${styles.folderOptionsBarButton} ${(selectedItems.some(selectedItem => selectedItem.file_name != "") ? "": styles.inactive)}`}>
                    <img src="/rename_icon.png" alt="rename file"  onClick={() => {editItem(selectedItems[0])}}/>
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