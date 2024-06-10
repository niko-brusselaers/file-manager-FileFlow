import { useEffect, useState } from "react";
import styles from "./FileTransferProgress.module.scss";
import tauriStore from "../../../../services/tauriStore";
import conversion from "../../../../services/conversion";
import { listen } from "@tauri-apps/api/event";
import { ITransferProgress } from "../../../types/ITransferProgress"; 

function fileTransferProgress() {
    const [fileTransferData,setFileTransferData] = useState<ITransferProgress>();
    const [fileName, setFileName] = useState<string>("")
    const [fileSize, setFileSize] = useState<string>("")
    const [progress, setProgress] = useState<string>("")
    const [code, setCode] = useState<string>("")

    const [dialogOpened, setDialogOpened] = useState<boolean>(false);

    useEffect(() => {
        let intervalId: NodeJS.Timeout | undefined;
        getTransferData();
        // Start fetching transfer progress when dialog is opened
        if (dialogOpened) {
            intervalId = setInterval(getTransferData, 100);
        } else {
            // If dialog is closed, clear the interval
            clearInterval(intervalId);
        }

        return () => clearInterval(intervalId); // Cleanup function
    }, [dialogOpened]);

    useEffect(() => {

        //listen for a event to open the dialog
        listen("openFileTransferProgressDialog", (event) => {
            let data = event.payload as {code:string,fileName:string};
            if(data.fileName === fileName) return;

            setCode(data.code);
            setFileName(data.fileName);
            setDialogOpened(true);
        })
        
    })

    async function getTransferData() {
        
        //get the transfer data from the local file
        await tauriStore.readKeyFromLocalFile<ITransferProgress>("fileTransfers.bin",fileName).then((data) => {
            if(data){
                setFileSize(conversion.convertFileSizeIdentifier(data.file_size as number));
                setProgress(conversion.convertFileSizeIdentifier(data.progress as number));

                setFileTransferData(data);
            }else setFileTransferData(undefined);

            
        }).catch((error) => {
            console.error(error);
        })
    }

    function closeDialog() {
    setDialogOpened(false);
    }

    return ( 
        <div className={dialogOpened ? styles.fileTransferDialog : "hidden"}>
            <div className={styles.fileTranferProgressInnerContainer}>
                <div className={styles.fileTransferProgressData}>
                    <h3>{fileTransferData?.file_name}</h3>
                    {(code ? <p>code: {code} <img src="/copy_icon.png" alt="" title="copy"/></p>: <p> </p>)}
                </div>
                <div className={styles.fileTransferProgressBar}>
                <div>
                    <p>{fileTransferData?.direction}</p>
                    <p>{progress}/{fileSize}</p>
                </div>
                <progress value={fileTransferData?.progress} max={fileTransferData?.file_size}></progress>
                </div>
                <div className={styles.fileTransferProgressButtonContainer}>
                    <button onClick={()=> { closeDialog()}}>close</button>
                </div>
                </div>
        </div>
     );
}

export default fileTransferProgress;