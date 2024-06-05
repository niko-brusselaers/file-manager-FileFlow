import { useEffect, useState } from "react";
import styles from "./NotificationContainer.module.scss"
import { INotificationData } from "../../types/INotificationData";
import NotifactionItem from "./components/NotificationItem";
import { listen } from "@tauri-apps/api/event";
import { ITransferRequest } from "../../types/ITransferRequest";
import tauriStore from "../../../services/tauriStore";

function NotificationContainer() {
    const [notificationError, setNotificationError] = useState<INotificationData|null>({type: "error", error: "Error message"});
    const [notificationMessage, setNotificationMessage] = useState<INotificationData|null>();
    const [notifcationProgress, setNotifcationProgress] = useState<INotificationData|null>({type: "FileTransferProgress", transferProgress: {file_name: "File Name", progress: 50, file_size:100,direction:"send"}});

    useEffect(() => {
        listen("transferFileRequest", (event) => {
            const data = event.payload as ITransferRequest
            
            // set the notification message
            setNotificationMessage({
                type: "fileTransferRequest", 
                transferRequest: data
            })

            tauriStore.setKeyToLocalFile("fileTransfersRequest.bin",data.fileDetails.fileName, data)
        })
    },[])

    return ( 
        <div className={styles.notifcationContainer}>
            {/* {notificationError && <NotifactionItem NotificationData={notificationError} clearNotification={() => setNotificationError(null)}/>} */}
            {notificationMessage && <NotifactionItem NotificationData={notificationMessage} clearNotification={() => setNotificationMessage(null)}/>}
            {/* {notifcationProgress && <NotifactionItem NotificationData={notifcationProgress} clearNotification={() => setNotifcationProgress(null)}/>} */}
        </div>  
     );
}

export default NotificationContainer;