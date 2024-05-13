import styles from './FileTransferHub.module.scss';

function FileTransferHub({dialogOpened, setDialogOpened}:{dialogOpened: boolean, setDialogOpened: Function}) {
    

    return ( 
        <div className={dialogOpened ? styles.fileTransferDialog : styles.hidden}>
            <div className={styles.filetransferViewHub}>
                <div className={styles.dialogButtonsBottomContainer}>
                    <button onClick={() => {setDialogOpened(false)}}>Cancel</button>
                </div>
            </div>
        </div>
     );
}

export default FileTransferHub;