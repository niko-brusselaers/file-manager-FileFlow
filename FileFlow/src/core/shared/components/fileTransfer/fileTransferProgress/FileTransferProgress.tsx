import { useEffect, useState } from "react";
import styles from "./FileTransferProgress.module.scss";
import tauriStore from "../../../../services/tauriStore";
import conversion from "../../../../services/conversion";
import { listen } from "@tauri-apps/api/event";
import { ITransferProgress } from "../../../types/ITransferProgress"; 

function fileTransferProgress() {
    const [fileTransferData,setFileTransferData] = useState<ITransferProgress>();
    const [fileName, setFileName] = useState<string>("")
    const [code, setCode] = useState<string>("")

    const [dialogOpened, setDialogOpened] = useState<boolean>(false);

    useEffect(() => {
        let intervalId: number | undefined;
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
            console.log(data);

            if(data){
                let fileSize = conversion.convertFileSizeIdentifier(data.file_size as number);
                let progress = conversion.convertFileSizeIdentifier(data.progress as number);

                setFileTransferData({
                    ...data,
                    file_size: fileSize,
                    progress: progress as string,
                })
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
            <div className={styles.fileTransferDialogInnerContent}>
                <h3>{fileTransferData?.file_name}</h3>
            <div className={styles.fileTransferProgressData}>
            <div>
                <p>{fileTransferData?.direction}</p>
                <p>{fileTransferData?.progress}/{fileTransferData?.file_size}</p>
            </div>
            <progress value={fileTransferData?.progress} max={fileTransferData?.file_size}></progress>
            </div>
            <button onClick={()=> { closeDialog()}}>close</button>
            </div>
            
        </div>
     );
}

export default fileTransferProgress;