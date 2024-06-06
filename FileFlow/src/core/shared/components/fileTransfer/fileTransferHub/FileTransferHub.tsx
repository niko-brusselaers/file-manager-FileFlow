import { useEffect, useRef, useState } from 'react';
import styles from './FileTransferHub.module.scss';
import FileTransferItem from './components/fileTransferItem/FileTransferItem';
import AddTransferDialog from './components/addTransferDialog/AddTransferDialog';
import tauriStore from '../../../../services/tauriStore';
import { ITransferProgress } from '../../../types/ITransferProgress';
import FileTransferRequestDialog from './components/fileTransferRequestsDialog/FileTransferRequestDialog';

function FileTransferHub({dialogOpened, setDialogOpened}:{dialogOpened: boolean, setDialogOpened: Function}) {
    const [fileTransferData,setFileTransferData] = useState<ITransferProgress[]>([]);
    const [transferWithCodeDialogIsOpen, setTransferWithCodeDialogIsOpen] = useState<boolean>(false);
    const [fileTransferRequestDialogIsOpen, setFileTransferRequestDialogIsOpen] = useState<boolean>(false);

    let dialogOpenedRef = useRef<boolean>();
    dialogOpenedRef.current = dialogOpened;

    useEffect(() => getTransferData(),[dialogOpened])

    function getTransferData() {
        tauriStore.readLocalFile<ITransferProgress>("fileTransfers.bin").then((data) => { 

            if(data) setFileTransferData(data);            
            
            if(dialogOpenedRef.current) setTimeout(() => {getTransferData()}, 100)

        })
    }

    
    return ( 
        <div className={dialogOpened ? styles.fileTransferDialog : "hidden"}>
            <AddTransferDialog transferDialogOpened={transferWithCodeDialogIsOpen} setTransferDialogOpened={setTransferWithCodeDialogIsOpen} />
            <FileTransferRequestDialog dialogOpened={fileTransferRequestDialogIsOpen} setDialogOpend={setFileTransferRequestDialogIsOpen}/>
            <div className={styles.filetransferViewHub}>
                <div className={styles.buttonContainer}>
                        <button className={styles.dropDownButton} onClick={() => {setTransferWithCodeDialogIsOpen(true)}}>Add with code</button>
                        <button className={styles.dropDownButton} onClick={() => setFileTransferRequestDialogIsOpen(true)}>pending requests</button>
                </div>
                <div className={styles.fileTransfersContainer}>
                    {fileTransferData.length ? fileTransferData.map((fileTransferData, index) => <FileTransferItem key={index} fileTransferData={fileTransferData}/>) : <div className={styles.fileTransferPlaceHolder}><h1>No file transfers have been initiated or completed.</h1></div>}
                </div>
                <div className={styles.dialogButtonsBottomContainer}>
                    <button onClick={() => {setDialogOpened(false)}}>Cancel</button>
                </div>
            </div>
        </div>
     );
}

export default FileTransferHub;