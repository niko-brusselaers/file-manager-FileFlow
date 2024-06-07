import styles from "./ConfirmationDialog.module.scss";

function ConfirmationDialog({confirmationDialogOpened,setConfimationDialogOpened,warningMessage,setWarningMessage,updateType,clearCache}: {confirmationDialogOpened:boolean,setConfimationDialogOpened:Function,warningMessage:string,setWarningMessage:Function,updateType:string,clearCache:Function}) {

    function confirm() {
        setConfimationDialogOpened(false);
        setWarningMessage("");
        clearCache(updateType);
    }

    function closeDialog(){
        setConfimationDialogOpened(false);
        setWarningMessage("");
    }

    return ( 
         <div className={(confirmationDialogOpened ? styles.confirmDialogContainer : "hidden")}>
            <div className={styles.innerContainer}>
                <h3>Clear {updateType}</h3>
                <p>{warningMessage}</p>
                <div className={styles.dialogButtonsContainer}>
                    <button onClick={confirm}>Yes</button>
                    <button onClick={closeDialog}>No</button>
                </div>
            </div>
        </div>
     );
}

export default ConfirmationDialog;