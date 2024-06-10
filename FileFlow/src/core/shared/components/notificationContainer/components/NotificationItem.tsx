import { useState } from "react";
import { INotificationData } from "../../../types/INotificationData";
import styles from "./NotificationItem.module.scss"
import { ITransferRequest } from "../../../types/ITransferRequest";
import fileTransfer from "../../../../services/fileTransfer";
import tauriStore from "../../../../services/tauriStore";

function NotifactionItem({NotificationData,clearNotification,setTimeout,clearTimeout}: {NotificationData: INotificationData, clearNotification: () => void,setTimeout: Function,clearTimeout: Function}) {
    const [notificationType,setNoticationType] = useState<string>()
    const [notificationHeader,setNotificationHeader] = useState<string>("")
    const [fileTransferRequest,setFileTransferRequest] = useState<ITransferRequest>()
    const messageTypes = ["fileTransferSuccess","fileTransferStarted","message"]

    useState(() => {
        if(NotificationData.type === "error") setNoticationType("error")
        if(NotificationData.type === "fileTransferRequest") {
            setNoticationType("request")
            setFileTransferRequest(NotificationData.transferRequest)
        }
        if(messageTypes.includes(NotificationData.type)) setNoticationType("message")
        setNotificationHeader(NotificationData.type.split(/(?=[A-Z])/).join(' '))
    console.log(NotificationData);
    
    })

    function acceptRequest(code: string){
        // accept the request
        fileTransfer.downloadFiles(code)
        clearNotification()
        tauriStore.removeKeyFromLocalFile("fileTransferRequest",fileTransferRequest!.fileDetails.fileName)
    }

    function declineRequest(code: string){
        // decline the request
        fileTransfer.declineRequest(code)
        tauriStore.removeKeyFromLocalFile("fileTransferRequest",fileTransferRequest!.fileDetails.fileName)
        clearNotification()
    }



    return ( 
        <div className={styles.notificationItem} onMouseEnter={() =>clearTimeout} onMouseLeave={() => setTimeout}>
            <div className={styles.notificationItemHeader}>
                <h3 className={styles.notificationheaderTitle}>{notificationHeader}</h3>
                <img className={styles.removeNotification} onClick={clearNotification} src="/close_icon.svg"/>
            </div>
            <div className={styles.noticationItemContent}>
                {notificationType === "error" && <p>{NotificationData.error}</p>}
                {notificationType === "request" && 
                <div className={styles.transferRequestContainer}>
                    <p>do you want to accept {fileTransferRequest?.fileDetails.fileName}, {fileTransferRequest?.fileDetails.fileSize} from {fileTransferRequest?.userNameSender}</p>
                    <div>
                        <button className={styles.acceptIcon}>
                            <img src="/check_icon.svg" alt="" onClick={() => acceptRequest(fileTransferRequest!.code)}/>
                        </button>
                        <button className={styles.cancelIcon}>
                            <img  src="/close_icon.svg" alt="" onClick={() => declineRequest(fileTransferRequest!.code)}/>
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