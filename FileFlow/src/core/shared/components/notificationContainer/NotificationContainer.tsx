import { useEffect, useRef, useState } from "react";
import styles from "./NotificationContainer.module.scss"
import { INotificationData } from "../../types/INotificationData";
import NotifactionItem from "./components/NotificationItem";
import { listen } from "@tauri-apps/api/event";
import { ITransferRequest } from "../../types/ITransferRequest";
import tauriStore from "../../../services/tauriStore";

function NotificationContainer() {
    const [notificationError, setNotificationError] = useState<INotificationData|null>();
    const [notificationMessage, setNotificationMessage] = useState<INotificationData|null>();

    const messageTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        listen("error", (event) => {
            const data = event.payload as string
            setNotificationError({type: "error", error: data});

            setNotificationErrorTimeout();
        })

        listen("FileTransferStarted", (event) => {
            const data = event.payload as {fileName:string, receiver: string}

            // set the notification message
            setNotificationMessage({
                type: "fileTransferStarted", 
                message: `File ${data.fileName} is being sent to ${data.receiver}`
            })
        })

        listen("transferFileRequest", (event) => {
            const data = event.payload as ITransferRequest
            
            // set the notification message
            setNotificationMessage({
                type: "fileTransferStarted", 
                transferRequest: data
            })

            tauriStore.setKeyToLocalFile("fileTransfersRequest.bin",data.fileDetails.fileName, data)

            setNotificationMessageTimeout();

        })

        listen("FileTransferSuccess", (event) => {
            console.log(event.payload);
            
            const data = event.payload as {fileName:string, direction: string}
            let message = data.direction === "send" ? `File ${data.fileName} has been successfully transferred` : `File ${data.fileName} has been successfully received`
            // set the notification message
            setNotificationMessage({
                type: "fileTransferSuccess", 
                message: message
            })

            setNotificationMessageTimeout();
        })
    },[])

    function setNotificationMessageTimeout(){
        messageTimeoutRef.current = setTimeout(() => {
            setNotificationMessage(null);
        }, 10000);
    }

    function clearNotificationMessageTimeout(){
        if(messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
    }

    function setNotificationErrorTimeout(){
        errorTimeoutRef.current = setTimeout(() => {
            setNotificationError(null);
        }, 10000);
    }

    function clearNotificationErrorTimeout(){
        if(errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
    }




    return ( 
        <div className={styles.notifcationContainer}>
            {notificationError && <NotifactionItem 
                NotificationData={notificationError} 
                clearNotification={() => setNotificationError(null)}
                clearTimeout={clearNotificationErrorTimeout}
                setTimeout={setNotificationErrorTimeout}/>}
            {notificationMessage && <NotifactionItem 
                NotificationData={notificationMessage} 
                clearNotification={() => setNotificationMessage(null)} 
                setTimeout={setNotificationMessageTimeout} 
                clearTimeout={clearNotificationMessageTimeout}/>}
        </div>  
     );
}

export default NotificationContainer;