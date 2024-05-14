import { useState } from 'react';
import styles from './FileTransferSend.module.scss';
import { IFile } from '../../../types/IFile';
import fileTransfer from '../../../../services/fileTransfer';
import { emit, listen,UnlistenFn } from '@tauri-apps/api/event';

function FileTransferSend({dialogOpened, setDialogOpened,selectedItem}:{dialogOpened: boolean, setDialogOpened: Function,selectedItem:IFile|null}) {
    const [selectedDestination, setSelectedDestination] = useState<string|null>(null);
    const [contact] = useState<string[]| null>([
        "example1@email.com",
        "example2@email.com",
        "example3@email.com",
        "example4@email.com",

    ]);
    const [filteredContacts, setFilteredContacts] = useState<string[]| null>(contact);
    const [recent] = useState<string[]| null>([
        "recentEx@mail.com",
        "recentEx2@mail.com",
        "recentEx3@mail.com",]);
    const [devices] = useState<string[]| null>([
        "device1",
        "device2",
        "device3",
        "device4"
    ]);

    //filter contacts when user types in the input field
    function filterContacts(filterInput:string){
        const filterInputLowaeCase = filterInput.toLowerCase();
        const filterContacts = contact?.filter((contact) => contact.toLowerCase().includes(filterInputLowaeCase));
        if(filterContacts) setFilteredContacts(filterContacts);
        else setFilteredContacts([]);
    }

    async function sentFile() {
        if(!selectedItem) return;

        const listenEvent = listen("fileTransferCode", (event) => {
            //send fileName and code to the file transfer progress dialog to display the progress
            let data = {
                code: event.payload as string,
                fileName: selectedItem.file_name,
            }

            emit("openFileTransferProgressDialog",data)

            listenEvent.then((unlisten:UnlistenFn) => unlisten())
        })
        
        await fileTransfer.sentFiles(selectedItem.file_path);
        
        
        
    }

    return ( 
        <dialog className={dialogOpened ? styles.fileTransferDialog : "hidden"}>
            <div className={styles.filetransferViewSend}>
                <div className={styles.itemDetailsContainer}>
                    <img src="/file_icon.png" alt="" />
                    <div>
                        <h2>{selectedItem?.file_name}</h2>
                        <div className={styles.fileSubDetailsContainer}>
                            <p>{selectedItem?.file_type}</p>
                            <p>{selectedItem?.file_size}</p>
                        </div>
                    </div>
                </div>
                <div>
                    <h2>Share this file</h2>
                    <input type="text"  placeholder='enter email' className={styles.inputForm} onChange={(event) => filterContacts(event.currentTarget.value)}/>
                    <div className={styles.selectionItemsContainer}>
                        {filteredContacts?.map((destination, index) =>
                             <button className={`${styles.destination} ${destination === selectedDestination ? styles.selectedDestination : ''}`} key={index} onClick={() => {setSelectedDestination(destination)}}>{destination}</button>)}
                    </div>
                </div>
                <div>
                    <h2>own devices</h2>
                    <div className={styles.selectionItemsContainer}>
                        {devices?.map((destination, index) => <button className={`${styles.destination} ${destination === selectedDestination ? styles.selectedDestination : ''}`} key={index}  onClick={() => {setSelectedDestination(destination)}}>{destination}</button>)}    
                    </div>
                </div>
                <div >
                    <h2>Recent</h2>
                    <div className={styles.selectionItemsContainer}>
                        {recent?.map((destination, index) => <button className={`${styles.destination} ${destination === selectedDestination ? styles.selectedDestination : ''}`} key={index}  onClick={() => {setSelectedDestination(destination)}}>{destination}</button>)}
                    </div>
                </div>
                <div>
                    <button className={`${styles.otherShareOptionButton} ${selectedDestination === "other" ? styles.selectedDestination : ''}`} onClick={() => {setSelectedDestination("other")}}>other</button>
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