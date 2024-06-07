import { useEffect, useState } from "react";

import styles from "./UpdateValueDialog.module.scss";

function UpdateValueDialog({initialValue,warningMessage,setWarningMessage,updateType,updateValue,dialogOpened,setDialogOpened}: {initialValue: string,warningMessage:string,setWarningMessage:Function,updateType:string, updateValue: Function,dialogOpened:boolean, setDialogOpened: Function}) {
    const [value, setValue] = useState<string>("");
    const [transferDialogOpened, setTransferDialogOpened] = useState<boolean>(false);

    useEffect(() => {
        if(!dialogOpened) setDialogOpened(false);
        setValue(initialValue);
        setTransferDialogOpened(dialogOpened);
    },[initialValue,dialogOpened])

    function handleUpdate(event: React.MouseEvent<HTMLButtonElement> | React.FormEvent<HTMLFormElement>){
        event.preventDefault();
        if(!value) return;
        updateValue(value);
        setValue("");
        
    }

    function closeDialog(){
        setDialogOpened(false);
        setValue("");
        setWarningMessage("");
    }

    return ( 
        <div className={(transferDialogOpened ? styles.addTransferDialogContainer : "hidden")}>
            <form onSubmit={handleUpdate} className={styles.dialogInnerContainer}>
                <h3>edit {updateType}</h3>
                <p>{warningMessage}</p>
                <input type="text"value={value} onChange={(event) => {setValue(event.target.value);}} />
                <div className={styles.dialogButtonsBottomContainer}>
                    <button onClick={handleUpdate}>Update</button>
                    <button onClick={closeDialog}>Cancel</button>
                </div>
            </form>
        </div>
     );
}

export default UpdateValueDialog;