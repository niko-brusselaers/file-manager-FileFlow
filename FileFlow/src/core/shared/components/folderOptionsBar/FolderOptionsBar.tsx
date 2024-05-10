import styles from './FolderOptionsBar.module.scss';
import { IFile } from '../../types/IFile';

function FolderOptionsBar({openTransferDialog, selectedItem}: {openTransferDialog: Function, selectedItem: IFile}){
    

    function openTransferSend(){
        if(selectedItem.file_name != "") openTransferDialog(selectedItem);
        else return;
    }
    
    return (
        <div className={styles.folderOptionsBar}>
            <div className={styles.folderOptionsBarButtonGroup}>
                <button className={styles.folderOptionsBarButton}>
                <img src="/create_icon.png" alt="create file" />
                </button>
                <button className={styles.folderOptionsBarButton}>
                    <img src="/cut_icon.png" alt="create file" />
                </button>
                <button className={styles.folderOptionsBarButton}>
                    <img src="/copy_icon.png" alt="create file" />
                </button>
                <button className={styles.folderOptionsBarButton}>
                    <img src="/delete_icon.png" alt="create file" />
                </button>
                <button className={styles.folderOptionsBarButton}>
                    <img src="/rename_icon.png" alt="create file" />
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