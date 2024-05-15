import styles from "./FileTransferItem.module.scss";
import { ITransferProgress } from "../../../../types/ITransferProgress";
import { emit } from "@tauri-apps/api/event";
import tauriStore from "../../../../../services/tauriStore";

function FileTransferItem({fileTransferData}:{fileTransferData:ITransferProgress}) {


    function openFileTransferProgressDialog() {        
         let data = {
                code: "",
                fileName: fileTransferData.file_name,
            }

        emit("openFileTransferProgressDialog",data)
    }

    
    async function removeTransferData(){
        await tauriStore.removeKeyFromLocalFile("fileTransfers.bin",fileTransferData.file_name)
    }


    return ( 
        <div className={styles.fileTransferItemContainer} >
            <h3>{fileTransferData.file_name}</h3>
            <div className={styles.FileTransferItemProgressData}>
                <progress value={fileTransferData.progress} max={fileTransferData.file_size}/>
                <div>
                    <button onClick={async() => await removeTransferData()}>remove</button>
                    <button onClick={() => {openFileTransferProgressDialog()}}>open</button>
                </div>
            </div>
            
            

        </div>
     );
}

export default FileTransferItem;