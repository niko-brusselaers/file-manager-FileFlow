import { useEffect, useState } from 'react';
import styles from './FileTransferSend.module.scss';
import { IFile } from '../../../types/IFile';
import fileTransfer from '../../../../services/fileTransfer';
import { emit, listen,UnlistenFn } from '@tauri-apps/api/event';
import { Socket } from 'socket.io-client';
import { IConnectedDevice } from '../../../types/IConnectedDevice';
import { ITransferRequest } from '../../../types/ITransferRequest';

function FileTransferSend({dialogOpened, setDialogOpened,selectedItems,websocket}:{dialogOpened: boolean, setDialogOpened: Function,selectedItems:IFile[]|null,websocket?:Socket<any>}) {
    const [selectedDestination, setSelectedDestination] = useState<IConnectedDevice>({deviceName:"",publicIPAdress:"",socketId:"",userName:""});
    const [localDevices,setLocalDevices] = useState<IConnectedDevice[]| null>([]);
    const [deviceName] = useState<string>(localStorage.getItem("deviceName") || "")

    useEffect(() => {
        if(dialogOpened) requestLocalDevices();
        else {
            unlistenForLocalDevices();
            setSelectedDestination({deviceName:"",publicIPAdress:"",socketId:"",userName:""});
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
                console.log(data);
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
                        fileSize: selectedItems[0].size,
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
                        <h2>{selectedItems?.[0]?.name}</h2>
                        <div className={styles.fileSubDetailsContainer}>
                            <p>{selectedItems?.[0]?.extension}</p>
                            <p>{selectedItems?.[0]?.size}</p>
                        </div>
                    </div>
                </div>
                <div>
                    <h2>local devices</h2>
                    <div className={styles.selectionItemsContainer}>
                        {localDevices?.map((destination, index) => <button className={`${styles.destination} ${destination.deviceName === selectedDestination?.deviceName ? styles.selectedDestination : ''}`} key={index}  onClick={() => {setSelectedDestination(destination)}}>{destination.deviceName}</button>)}
                    </div>
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