import { useEffect, useState } from 'react';
import styles from './FileTransferSend.module.scss';
import { IFile } from '../../../types/IFile';
import fileTransfer from '../../../../services/fileTransfer';
import { emit, listen,UnlistenFn } from '@tauri-apps/api/event';
import { Socket } from 'socket.io-client';
import { IConnectedDevice } from '../../../types/IConnectedDevice';
import { ITransferRequest } from '../../../types/ITransferRequest';
import fileManagement from '../../../../services/fileManagement';
import conversion from '../../../../services/conversion';

function FileTransferSend({dialogOpened, setDialogOpened,selectedItems,websocket}:{dialogOpened: boolean, setDialogOpened: Function,selectedItems:IFile[]|null,websocket?:Socket<any>}) {
    const [selectedDestination, setSelectedDestination] = useState<IConnectedDevice>({deviceName:"",publicIPAdress:"",socketId:"",userName:""});
    const [localDevices,setLocalDevices] = useState<IConnectedDevice[]| null>([]);
    const [deviceName] = useState<string>(localStorage.getItem("deviceName") || "")
    const [selectedItemsSize,setSelectedItemsSize] = useState<string>("Loading...");

    useEffect(() => {
        if(dialogOpened) {
            requestLocalDevices();
            if(selectedItems?.[0].extension === "folder") fileManagement.getFolderSize(selectedItems[0].path).then((size) => {
                if(size) setSelectedItemsSize(conversion.convertFileSizeIdentifier(size));
            });
            else {
                if(selectedItems?.[0].size) setSelectedItemsSize(selectedItems?.[0].size);
            }
        }
        else {
            unlistenForLocalDevices();
            setSelectedDestination({deviceName:"",publicIPAdress:"",socketId:"",userName:""});
            setSelectedItemsSize("Loading...");
        }
    },[dialogOpened])

    function requestLocalDevices(){
        
        //check if dialog is opened and websocket object is available
        if(!dialogOpened) return;
        if(!websocket) return;
        
        if(websocket.connected){
            //listen for event to get local devices
            websocket.on("localDevices",(data:IConnectedDevice[]) => {
                setLocalDevices(data.filter((device) => device.deviceName !== deviceName));
            });

            //sent new request for local devices when a device disconnects
            websocket.on("localChange",() => {
                websocket.emit("requestLocalDevices");
            });

            //sent initial request for local devices
            websocket.emit("requestLocalDevices");
        }else{
            websocket.connect();

            setTimeout(() => {
                requestLocalDevices();
            }, 1000);
        }
    }

    function unlistenForLocalDevices(){
        websocket?.off("localDevices");
        websocket?.off("localDisconnect");
    }


    async function sentFile() {
        if(!selectedItems) return;

        const listenEvent = listen("fileTransferCode", (event) => {
            //send fileName and code to the file transfer progress dialog to display the progress
            let data = {
                code: event.payload as string,
                fileName: selectedItems[0].name,
            }


            if(selectedDestination?.deviceName === "other") {
                emit("openFileTransferProgressDialog",data)
                listenEvent.then((unlisten:UnlistenFn) => unlisten());
            } else{
                 //send transferFile Request to the selected destination
                const transferRequest:ITransferRequest={
                    code: data.code,
                    socketIdReceiver: selectedDestination?.socketId,
                    socketIdSender: websocket?.id || "",
                    userNameReceiver: selectedDestination?.userName,
                    userNameSender: localStorage.getItem("name") || "User",

                    fileDetails:{
                        fileName: selectedItems[0].name,
                        fileSize: selectedItemsSize,
                        fileType: selectedItems[0].extension,
                    }
                }

                if(websocket) {
                    websocket.emit("transferFileRequest",transferRequest)
                    emit("FileTransferStarted",{fileName: selectedItems[0].name, receiver: selectedDestination?.userName || "unknown"})
                };
                
                
            }

            listenEvent.then((unlisten:UnlistenFn) => unlisten())

            setDialogOpened(false)
            
        })
        
        await fileTransfer.sentFiles(selectedItems[0].path);
        
    }

    return ( 
        <dialog className={dialogOpened ? styles.fileTransferDialog : "hidden"}>
            <div className={styles.filetransferViewSend}>
                <div className={styles.itemDetailsContainer}>
                    <img src="/file_icon.png" alt="" />
                    <div>
                        <h3>{selectedItems?.[0]?.name}</h3>
                        <div className={styles.fileSubDetailsContainer}>
                            <p>{selectedItems?.[0]?.extension}</p>
                            <p>{selectedItemsSize}</p>
                        </div>
                    </div>
                </div>
                <div>
                    <h3>recents</h3>
                    <div className={styles.placeHolderContainer}>
                        <h4>Coming soon</h4>
                    </div>
                    <h3>personal devices</h3>
                    <div className={styles.placeHolderContainer}>
                        <h4>Coming soon</h4>
                    </div>
                    
                    <h3>local devices</h3>
                    {localDevices?.length ? 
                        <div className={styles.selectionItemsContainer}>
                        {localDevices?.map((destination, index) => <button className={`${styles.destination} ${destination.deviceName === selectedDestination?.deviceName ? styles.selectedDestination : ''}`} key={index}  onClick={() => {setSelectedDestination(destination)}}>{destination.deviceName}</button>)}
                        </div> : 
                         <div className={styles.placeHolderContainer}>
                            <h3>Searching for nearby devices</h3>
                         </div>
                        }
                    
                </div>
                <div>
                    <button className={selectedDestination?.deviceName === "other" ? styles.otherShareOptionSelected : styles.otherShareOptionButton} 
                            onClick={() => {setSelectedDestination({deviceName:"other",publicIPAdress:"",socketId:"",userName:""})}}>other</button>
                </div>
                <div className={styles.dialogButtonsBottomContainer}>
                    <button onClick={() => {sentFile()}} disabled={selectedDestination?.deviceName == ""} className={selectedDestination?.deviceName != "" ? "" : styles.disabled}>Share</button>
                    <button onClick={() => {setDialogOpened(false)}}>Cancel</button>
                </div>

                
            </div>
        </dialog>
     );
}

export default FileTransferSend;