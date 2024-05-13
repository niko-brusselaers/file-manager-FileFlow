import { useEffect, useState } from 'react';
import styles from './FileTransferHub.module.scss';

import FileTransferItem from './fileTransferItem/FileTransferItem';
import { IFileTransferData } from '../../../types/IFileTransferData';
import AddTransferDialog from './addTransferDialog/AddTransferDialog';

function FileTransferHub({dialogOpened, setDialogOpened}:{dialogOpened: boolean, setDialogOpened: Function}) {
    const [dropDownMenuOpen, setDropDownMenuOpen] = useState<boolean>(false);
    const [fileTransferData,setFileTransferData] = useState<IFileTransferData[]>([]);
    const [transferWithCodeDialogIsOpen, setTransferWithCodeDialogIsOpen] = useState<boolean>(false);

    useEffect(() => {

        document.addEventListener("mousedown", (event) => {
            //classnames of the elements that should not close the dropdown bar
            const dropDownTargets = [
                document.querySelector("."+styles.dropDownButton)?.className,
            ]            
            //get the class name of the selected element
            let selectedClasname = (event.target as HTMLElement).className as string;                
                
            if(!dropDownTargets.includes(selectedClasname)) {
                setDropDownMenuOpen(false)
            }
            
        })
    },[])

    function openDrownDownMenu() {
        setDropDownMenuOpen(!dropDownMenuOpen);
        
    }

    return ( 
        <div className={dialogOpened ? styles.fileTransferDialog : "hidden"}>
            <AddTransferDialog transferDialogOpened={transferWithCodeDialogIsOpen} setTransferDialogOpened={setTransferWithCodeDialogIsOpen} />
            <div className={styles.filetransferViewHub}>
                <div className={styles.dropDownMenu}>
                    <button className={styles.dropDownButton} onClick={() => {openDrownDownMenu()}}>More</button>
                    <div className={`${(dropDownMenuOpen ?  styles.dropDownContainer : "hidden" )}`}>
                        <button className={styles.dropDownButton} onClick={() => {setTransferWithCodeDialogIsOpen(true)}}>Add with code</button>
                        <button className={styles.dropDownButton}>pending requests</button>
                    </div>

                </div>
                <div className={styles.fileTransfersContainer}>
                    {fileTransferData.map((fileTransferData, index) => <FileTransferItem key={index} fileTransferData={fileTransferData}/>)}
                </div>
                <div className={styles.dialogButtonsBottomContainer}>
                    <button onClick={() => {setDialogOpened(false)}}>Cancel</button>
                </div>
            </div>
        </div>
     );
}

export default FileTransferHub;