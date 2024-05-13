import { useState } from 'react';
import styles from './FileTransferSend.module.scss';
import rustService from '../../../../services/rustService';
import { IFile } from '../../../types/IFile';

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
        await rustService.sentFiles(selectedItem.file_path);
       

    }

    return ( 
        <div className={dialogOpened ? styles.fileTransferDialog : "hidden"}>
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
        </div>
     );
}

export default FileTransferSend;