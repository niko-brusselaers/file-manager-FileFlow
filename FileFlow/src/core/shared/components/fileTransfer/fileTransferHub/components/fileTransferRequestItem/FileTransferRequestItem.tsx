import fileTransfer from "../../../../../../services/fileTransfer";
import tauriStore from "../../../../../../services/tauriStore";
import { ITransferRequest } from "../../../../../types/ITransferRequest";
import styles from "./FileTransferRequestItem.module.scss";

function FileTransferRequestItem({fileTransferRequest,updateFileTransferRequestList}: {fileTransferRequest: ITransferRequest,updateFileTransferRequestList:Function}) {

    async function acceptRequest (fileTransferRequest: ITransferRequest){
        // accept the request
        fileTransfer.downloadFiles(fileTransferRequest.code)
        await tauriStore.removeKeyFromLocalFile("fileTransfersRequest.bin",fileTransferRequest!.fileDetails.fileName)
        updateFileTransferRequestList()
    }

    async function declineRequest(fileTransferRequest: ITransferRequest){
        // decline the request
        fileTransfer.declineRequest(fileTransferRequest.code)
        tauriStore.removeKeyFromLocalFile("fileTransfersRequest.bin",fileTransferRequest!.fileDetails.fileName)
        updateFileTransferRequestList()
    }
    
    return ( 
        <div className={styles.fileTransferRequestItem}>
            <h2>{fileTransferRequest.fileDetails.fileName}</h2>
            <div className={styles.innerContent}>
                <div className={styles.detailsConainer}>
                <p>From: {fileTransferRequest.userNameSender}</p>
                <p>Size: {fileTransferRequest.fileDetails.fileSize}</p>        
                </div>

                <div className={styles.buttonContainer}>
                    <button className={styles.acceptIcon}>
                        <img src="/check_icon.svg" alt="" onClick={() => acceptRequest(fileTransferRequest)}/>
                    </button>
                    <button className={styles.cancelIcon}>
                        <img  src="/close_icon.svg" alt="" onClick={() => declineRequest(fileTransferRequest)}/>
                    </button>
                </div>
            </div>
            
        </div>
     );
}

export default FileTransferRequestItem