import { useState } from "react";
import rustService from "../../../../../services/rustService";
import styles from "./AddTransferDialog.module.scss";

function AddTransferDialog({transferDialogOpened, setTransferDialogOpened}:{transferDialogOpened: boolean, setTransferDialogOpened: Function}) {
    const [inputCode, setInputCode] = useState<string>("");

    async function startDownload() {
        //start the download
        await rustService.downloadFiles(inputCode)
        setTransferDialogOpened(false)
    }

    return ( 
        <div className={(transferDialogOpened ? styles.addTransferDialogContainer : "hidden")}>
            <div className={styles.dialogInnerContainer}>
                <input type="text" onChange={(event) => {setInputCode(event.target.value)}} />
                <div className={styles.dialogButtonsBottomContainer}>
                        <button onClick={() => {startDownload()}}>Share</button>
                        <button onClick={() => {setTransferDialogOpened(false)}}>Cancel</button>
                </div>
            </div>
            
        </div>
     );
}

export default AddTransferDialog;