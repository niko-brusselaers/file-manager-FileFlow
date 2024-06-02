import { useEffect, useState } from 'react';
import styles from './FileTransferSend.module.scss';
import { IFile } from '../../../types/IFile';
import fileTransfer from '../../../../services/fileTransfer';
import { emit, listen,UnlistenFn } from '@tauri-apps/api/event';
import { Socket } from 'socket.io-client';
import { IConnectedDevice } from '../../../types/IConnectedDevice';
import { ITransferRequest } from '../../../types/ITransferRequest';
import tauriStore from '../../../../services/tauriStore';

function FileTransferSend({dialogOpened, setDialogOpened,selectedItems,websocket}:{dialogOpened: boolean, setDialogOpened: Function,selectedItems:IFile[]|null,websocket?:Socket<any>}) {
    const [selectedDestination, setSelectedDestination] = useState<IConnectedDevice|null>(null);
    const [contact] = useState<IConnectedDevice[]| null>([]);
    const [filteredContacts, setFilteredContacts] = useState<IConnectedDevice[]| null>(contact);
    const [recent] = useState<IConnectedDevice[]| null>([]);
    const [devices] = useState<IConnectedDevice[]| null>([]);
    const [localDevices,setLocalDevices] = useState<IConnectedDevice[]| null>([]);
    const [deviceName, setDeviceName] = useState<string>("")

    useEffect(() => {
        tauriStore.readKeyFromLocalFile<string>("credentials.bin","deviceName")
        .then((data) => {
            if(data) setDeviceName(data);
        })
        .catch((error) => {throw Error(error)});
    });

    useEffect(() => {
        
        if(dialogOpened) requestLocalDevices();
        else unlistenForLocalDevices();
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

    //filter contacts when user types in the input field
    function filterContacts(filterInput:string){
        const filterInputLowerCase = filterInput.toLowerCase();
        const filterContacts = contact?.filter((contact) => contact.userName?.toLowerCase().includes(filterInputLowerCase));
        if(filterContacts) setFilteredContacts(filterContacts);
        else setFilteredContacts([]);
    }

    async function sentFile() {
        if(!selectedItems) return;

        const listenEvent = listen("fileTransferCode", (event) => {
            //send fileName and code to the file transfer progress dialog to display the progress
            let data = {
                code: event.payload as string,
                fileName: selectedItems[0].name,
            }

            emit("openFileTransferProgressDialog",data)

            if(selectedDestination?.deviceName === "other") {
                listenEvent.then((unlisten:UnlistenFn) => unlisten());
            } else{
                 //send transferFile Request to the selected destination
                const transferRequest:ITransferRequest={
                    code: data.code,
                    socketId: selectedDestination?.socketId,
                    userName: selectedDestination?.userName,
                    fileDetails:{
                        fileName: selectedItems[0].name,
                        fileSize: selectedItems[0].size,
                        fileType: selectedItems[0].extension,
                    }
                }

                if(websocket) websocket.emit("transferFileRequest",transferRequest);
            }
            
           

            listenEvent.then((unlisten:UnlistenFn) => unlisten())
            
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
                    <h2>Share this file</h2>
                    <input type="text"  placeholder='enter email' className={styles.inputForm} onChange={(event) => filterContacts(event.currentTarget.value)}/>
                    <div className={styles.selectionItemsContainer}>
                        {filteredContacts?.map((destination, index) =>
                             <button className={`${styles.destination} ${destination === selectedDestination ? styles.selectedDestination : ''}`} key={index} onClick={() => {setSelectedDestination(destination)}}>{destination.userName}</button>)}
                    </div>
                </div>
                <div>
                    <h2>own devices</h2>
                    <div className={styles.selectionItemsContainer}>
                        {devices?.map((destination, index) => <button className={`${styles.destination} ${destination === selectedDestination ? styles.selectedDestination : ''}`} key={index}  onClick={() => {setSelectedDestination(destination)}}>{destination.deviceName}</button>)}    
                    </div>
                </div>
                <div >
                    <h2>Recent</h2>
                    <div className={styles.selectionItemsContainer}>
                        {recent?.map((destination, index) => <button className={`${styles.destination} ${destination === selectedDestination ? styles.selectedDestination : ''}`} key={index}  onClick={() => {setSelectedDestination(destination)}}>{destination.userName}</button>)}
                    </div>
                </div>
                <div >
                    <h2>local devices</h2>
                    <div className={styles.selectionItemsContainer}>
                        {localDevices?.map((destination, index) => <button className={`${styles.destination} ${destination.deviceName === selectedDestination?.deviceName ? styles.selectedDestination : ''}`} key={index}  onClick={() => {setSelectedDestination(destination)}}>{destination.deviceName}</button>)}
                    </div>
                </div>
                <div>
                    <button className={`${styles.otherShareOptionButton} ${selectedDestination?.deviceName === "other" ? styles.selectedDestination : ''}`} 
                            onClick={() => {setSelectedDestination({deviceName:"other",publicIPAdress:"",socketId:"",userName:""})}}>other</button>
                </div>
                <div className={styles.dialogButtonsBottomContainer}>
                    <button onClick={() => {sentFile()}}>Share</button>
                    <button onClick={() => {setDialogOpened(false)}}>Cancel</button>
                </div>

                
            </div>
        </dialog>
     );
}

export default FileTransferSend;