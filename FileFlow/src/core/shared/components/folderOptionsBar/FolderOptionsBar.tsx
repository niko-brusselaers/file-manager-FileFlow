import styles from './FolderOptionsBar.module.scss';
import { IFile } from '../../types/IFile';
import { emit } from '@tauri-apps/api/event';
import fileManagement from '../../../services/fileManagement';

function FolderOptionsBar({selectedItem,currentPath,deleteItem,createItem,editItem}: { selectedItem: IFile,currentPath:string,createItem:Function,deleteItem:Function,editItem:Function}){
    

    function openTransferSend(){
        if(selectedItem.file_name != "") emit("sendFile", {file: selectedItem});
        else return;
    }

    function moveItem(type:string){
        let moveItem:{type:string, item:IFile} | null = sessionStorage.getItem("moveItem") ? JSON.parse(sessionStorage.getItem("moveItem") || '') : null;
        console.log(moveItem);
        console.log(selectedItem.file_path);
        
        if(moveItem && !selectedItem.file_path) {
            // Execute the copy or cut operation when there is a moveItem but no selectedItem
            switch (type) {
                case "copy":
                    let copyPath = currentPath + "\\" + moveItem.item.file_name
                    fileManagement.copyItem(moveItem.item.file_path,copyPath)
                    sessionStorage.removeItem("moveItem")
                    break;
                case "cut":
                    let movePath = currentPath + "\\" + moveItem.item.file_name
                    fileManagement.moveItem(moveItem.item.file_path,movePath)
                    sessionStorage.removeItem("moveItem")
                    break;
                default:
                    break;
            }
        } else if(!moveItem && selectedItem.file_path) {
            // Set the moveItem in the session storage when there is a selectedItem but no moveItem
            sessionStorage.setItem("moveItem", JSON.stringify({type:type, item:selectedItem}))
        }
        
    };
    
    return (
        <div className={styles.folderOptionsBar}>
            <div className={styles.folderOptionsBarButtonGroup}>
                <button className={styles.folderOptionsBarButton} onClick={() => {createItem()}}>
                <img src="/create_icon.png" alt="create file" />
                </button>
                <button className={styles.folderOptionsBarButton} onClick={() => moveItem("cut")}>
                    <img src="/cut_icon.png" alt="cut file" />
                </button>
                <button className={styles.folderOptionsBarButton} onClick={()=> moveItem("copy")}>
                    <img src="/copy_icon.png" alt="copy file" />
                </button>
                <button className={styles.folderOptionsBarButton} onClick={() => {deleteItem(selectedItem)}}>
                    <img src="/delete_icon.png" alt="delete file" />
                </button>
                <button className={styles.folderOptionsBarButton}>
                    <img src="/rename_icon.png" alt="rename file"  onClick={() => {editItem(selectedItem)}}/>
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
                <button className={selectedItem ? styles.folderOptionsBarButton : styles.folderOptionsBarGreyedOut} onClick={() => {openTransferSend()}}>
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