import { useState } from "react";
import styles from "./NotificationContainer.module.scss"
import { INotificationData } from "../../types/INotificationData";
import NotifactionItem from "./components/NotificationItem";

function NotificationContainer() {
    const [notificationError, setNotificationError] = useState<INotificationData|null>({type: "error", error: "Error message"});
    const [notificationMessage, setNotificationMessage] = useState<INotificationData|null>({type: "fileTransferRequest", message: "Message", transferRequest: {fileDetails: {fileName: "File Name", fileSize: "100MB",fileType:"test"},code:"test", userName: "User"}});
    const [notifcationProgress, setNotifcationProgress] = useState<INotificationData|null>({type: "FileTransferProgress", transferProgress: {file_name: "File Name", progress: 50, file_size:100,direction:"send"}});

    return ( 
        <div className={styles.notifcationContainer}>
            {notificationError && <NotifactionItem NotificationData={notificationError} clearNotification={() => setNotificationError(null)}/>}
            {notificationMessage && <NotifactionItem NotificationData={notificationMessage} clearNotification={() => setNotificationMessage(null)}/>}
            {notifcationProgress && <NotifactionItem NotificationData={notifcationProgress} clearNotification={() => setNotifcationProgress(null)}/>}
        </div>  
     );
}

export default NotificationContainer;