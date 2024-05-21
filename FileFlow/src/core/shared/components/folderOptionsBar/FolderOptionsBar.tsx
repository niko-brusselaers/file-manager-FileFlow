import styles from './FolderOptionsBar.module.scss';
import { IFile } from '../../types/IFile';
import { emit, listen } from '@tauri-apps/api/event';
import { useEffect, useState } from 'react';
import tauriEmit from '../../../services/tauriEmit';

function FolderOptionsBar({selectedItems}: {selectedItems: IFile[]}){
    const [pasteItemData, setPasteItemData] = useState<{type:string, items:IFile[]} | null>(sessionStorage.getItem("moveItem") ? JSON.parse(sessionStorage.getItem("moveItem") || '') : null);

    useEffect(() => {
        listen("updateMoveItem", () => {
            setPasteItemData(sessionStorage.getItem("moveItem") ? JSON.parse(sessionStorage.getItem("moveItem") || '') : null);
        });
    },[])

    function openTransferSend(){
        if(selectedItems.some(selectedItem => selectedItem.file_name != "")) emit("sendFile", {file: selectedItems});
        else return;
    }

    
    return (
        <div className={styles.folderOptionsBar}>
            <div className={styles.folderOptionsBarButtonGroup}>
                <button className={styles.folderOptionsBarButton} onClick={tauriEmit.emitCreateCommand}>
                <img src="/create_icon.png" alt="create file" />
                </button>
                <button className={`${styles.folderOptionsBarButton} ${(selectedItems.some(selectedItem => selectedItem.file_name != "") ? "": styles.inactive)}`} onClick={tauriEmit.emitCutCommand}>
                    <img src="/cut_icon.png" alt="cut file" />
                </button>
                <button className={`${styles.folderOptionsBarButton} ${(selectedItems.some(selectedItem => selectedItem.file_name != "") ? "": styles.inactive)}`} onClick={tauriEmit.emitCopyCommand}>
                    <img src="/copy_icon.png" alt="copy file" />
                </button>
                <button className={`${styles.folderOptionsBarButton} ${(pasteItemData ? "": styles.inactive)}`} onClick={tauriEmit.emitPasteCommand}>
                    <img src="/paste_icon.svg" alt="paste file" />
                </button>
                <button className={`${styles.folderOptionsBarButton} ${(selectedItems.some(selectedItem => selectedItem.file_name != "") ? "": styles.inactive)}`} onClick={() => {tauriEmit.emitDeleteCommand}}>
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