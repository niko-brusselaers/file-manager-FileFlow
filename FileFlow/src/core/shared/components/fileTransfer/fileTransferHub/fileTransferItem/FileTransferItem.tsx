import { useEffect, useState } from "react";
import styles from "./FileTransferItem.module.scss";
import conversion from "../../../../../services/conversion";
import { ITransferProgress } from "../../../../types/ITransferProgress";
import { emit } from "@tauri-apps/api/event";

function FileTransferItem({fileTransferData}:{fileTransferData:ITransferProgress}) {
    const [fileTranferSize, setFileTransferSize] = useState<string>("");
    const [fileTransferProgress, setFileTransferProgress] = useState<string>("");

    useEffect(() => {
        //set the file transfer size and progress
        setFileTransferSize(conversion.convertFileSizeIdentifier(fileTransferData.file_size as number));

        setFileTransferProgress(conversion.convertFileSizeIdentifier(fileTransferData.progress as number))

    },[fileTransferData])

    function openFileTransferProgressDialog() {        
         let data = {
                code: "",
                fileName: fileTransferData.file_name,
            }

            emit("openFileTransferProgressDialog",data)
    }


    return ( 
        <button className={styles.fileTransferItemContainer} onClick={() => {openFileTransferProgressDialog()}}>
            <h3>{fileTransferData.file_name}</h3>
            <div className={styles.fileTransferProgressData}>
            <div>
                <p>{fileTransferData.direction}</p>
                <p>{fileTransferProgress}/{fileTranferSize}</p>
            </div>
            <progress value={fileTransferData.progress} max={fileTransferData.file_size}></progress>
            </div>
        </button>
     );
}

export default FileTransferItem;