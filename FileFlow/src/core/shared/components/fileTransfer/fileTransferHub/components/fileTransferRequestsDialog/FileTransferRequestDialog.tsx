import { useEffect, useState } from "react";
import styles from "./FileTransferRequestDialog.module.scss"
import { ITransferRequest } from "../../../../../types/ITransferRequest";
import tauriStore from "../../../../../../services/tauriStore";
import { listen } from "@tauri-apps/api/event";
import FileTransferRequestItem from "../fileTransferRequestItem/FileTransferRequestItem";

function FileTransferRequestDialog({dialogOpened,setDialogOpend}:{dialogOpened: boolean,setDialogOpend:Function} ) {
    const [fileTransferRequests,setFileTransferRequests] = useState<ITransferRequest[]>()

    useEffect(() => {

        // get the file transfer requests
        getFileTransferRequests()
        listen("transferFileRequest",getFileTransferRequests)

    },[dialogOpened])

    function getFileTransferRequests() {
        // get the file transfer requests
        tauriStore.readLocalFile<ITransferRequest>("fileTransfersRequest.bin").then((data) => setFileTransferRequests(data))
    }

    

    return ( 
        <div className={dialogOpened ? styles.fileTransferDialog : "hidden"}>
            <div className={styles.filetransferViewHub }>
                
                {fileTransferRequests?.length ? 
                    <div className={styles.transferRequestContainer}>
                        {fileTransferRequests.map((fileTransferRequest,index) => <FileTransferRequestItem key={index} fileTransferRequest={fileTransferRequest} updateFileTransferRequestList={getFileTransferRequests}/>)}
                    </div>
                    
                 : 
                    <div className={styles.fileTransferPlaceHolder}>
                        <h3>You have no pending file transfer requests</h3>
                    </div>}

                <div className={styles.dialogButtonsBottomContainer}>
                        <button onClick={() => {setDialogOpend(false)}}>Cancel</button>
                </div>
            </div>
        </div>
            

            

     );
}

export default FileTransferRequestDialog;