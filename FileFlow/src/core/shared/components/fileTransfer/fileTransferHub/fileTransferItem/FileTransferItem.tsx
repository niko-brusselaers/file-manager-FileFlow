import { useEffect, useState } from "react";
import { IFileTransferData } from "../../../../types/IFileTransferData";
import styles from "./FileTransferItem.module.scss";
import conversion from "../../../../../services/conversion";

function FileTransferItem({fileTransferData}:{fileTransferData:IFileTransferData}) {
    const [fileTranferSize, setFileTransferSize] = useState<string>("");
    const [fileTransferProgress, setFileTransferProgress] = useState<string>("");

    useEffect(() => {
        //set the file transfer size and progress
        setFileTransferSize(conversion.convertFileSizeIdentifier(fileTransferData.file_size));

        //remove all non numeric characters from the file transfer progress
        let progress = conversion.convertFileSizeIdentifier(fileTransferData.file_transfer_progress);
        progress = progress.replace(/[^0-9.]/g,"")
        setFileTransferProgress(progress);

    },[])

    return ( 
        <div className={styles.fileTransferItemContainer}>
            <h3>{fileTransferData.file_name}</h3>
            <div className={styles.fileTransferProgressData}>
            <div>
                <p>{fileTransferData.file__transfer_direction}</p>
                <p>{fileTransferProgress}/{fileTranferSize}</p>
            </div>
            <progress value={fileTransferData.file_transfer_progress} max={fileTransferData.file_size}></progress>
            </div>
            <button>cancel</button>
        </div>
     );
}

export default FileTransferItem;