import { useState } from "react";
import { INotificationData } from "../../../types/INotificationData";
import styles from "./NotificationItem.module.scss"
import { ITransferProgress } from "../../../types/ITransferProgress";
import { ITransferRequest } from "../../../types/ITransferRequest";
import fileTransfer from "../../../../services/fileTransfer";
import tauriStore from "../../../../services/tauriStore";

function NotifactionItem({NotificationData,clearNotification}: {NotificationData: INotificationData, clearNotification: () => void}) {
    const [notificationType,setNoticationType] = useState<string>()
    const [fileTransferData,setFileTransferData] = useState<ITransferProgress>()
    const [fileTransferRequest,setFileTransferRequest] = useState<ITransferRequest>()
    const progressTypes = ["FileTransferProgress","moveProgress","copyProgress"]

    useState(() => {
        if(NotificationData.type === "error") setNoticationType("error")
        if(progressTypes.includes(NotificationData.type)) {
            setNoticationType("progress")
            setFileTransferData(NotificationData.transferProgress)
        }
        if(NotificationData.type === "fileTransferRequest") {
            setNoticationType("request")
            setFileTransferRequest(NotificationData.transferRequest)
        }
        if(NotificationData.type === "fileTransferSuccess") setNoticationType("message")
    })

    const acceptRequest = (code: string) => () => {
        // accept the request
        fileTransfer.downloadFiles(code)
        clearNotification()
    }

    const declineRequest = (code: string) => () => {
        // decline the request
        fileTransfer.declineRequest(code)
        tauriStore.removeKeyFromLocalFile("fileTransferRequest",fileTransferRequest!.fileDetails.fileName)
        clearNotification()

    }



    return ( 
        <div className={styles.notificationItem}>
            <div className={styles.notificationItemHeader}>
                <h3 className={styles.notificationheaderTitle}>{NotificationData.type}</h3>
                <img className={styles.removeNotification} onClick={clearNotification} src="/close_icon.svg"/>
            </div>
            <div className={styles.noticationItemContent}>
                {notificationType === "error" && <p>{NotificationData.error}</p>}
                {notificationType === "progress" && 
                <>
                <p>{NotificationData.transferProgress?.file_name}</p>
                <progress value={fileTransferData?.progress} max={fileTransferData?.file_size}></progress>
                </>}
                {notificationType === "request" && 
                <div className={styles.transferRequestContainer}>
                    <p>do you want to accept {fileTransferRequest?.fileDetails.fileName}, {fileTransferRequest?.fileDetails.fileSize} from {fileTransferRequest?.userNameSender}</p>
                    <div>
                        <button className={styles.acceptIcon}>
                            <img src="/check_icon.svg" alt="" onClick={acceptRequest(fileTransferRequest!.code)}/>
                        </button>
                        <button className={styles.cancelIcon}>
                            <img  src="/close_icon.svg" alt="" onClick={declineRequest(fileTransferRequest!.code)}/>
                        </button>
                    </div>
                </div>
                }
                    
                {notificationType === "message" && <p>{NotificationData.message}</p>}
            </div>
        </div>
     );
}

export default NotifactionItem;