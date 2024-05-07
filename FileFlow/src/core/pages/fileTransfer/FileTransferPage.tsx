import { useState } from 'react';
import styles from './FileTransferPage.module.scss';
import { open } from "@tauri-apps/plugin-dialog"
import rustService from '../../services/rustService';

function FileTransferPage() {
    const [inputFilePath, setInputFilePath] = useState<string | null>(null);
    const [code, setCode] = useState<string| null>(null);

    async function openDIalog() {
        await open({
        multiple: false,
        directory: false,
        }).then((res) => { 
            if(res?.path === undefined) {
                console.log("no file selected");
                return;
            } 
            setInputFilePath(res?.path);
            
        });
        
        
    }

    async function sentFiles() {
        if(inputFilePath) await rustService.sentFiles(inputFilePath);
        else{
            console.error("please enter a file or folder")
        }

    }

    async function downloadFiles() {
        if(code) {
            console.log("starting download with code", code);
            
            await rustService.downloadFiles(code)
        }else{
            console.error("please enter a code")
        }
    }

    return ( 
        <>
            <div className={styles.filetransferView}>
                <h1>FileTransferPage</h1>
                <button onClick={() => openDIalog()}>open</button>
                <button onClick={() => sentFiles()}>send</button>
            </div>

            <div className={styles.filetransferView}>
                <h1>FileTransferPage</h1>
                <input type="text" onChange={(event) =>{setCode(event.currentTarget.value)} }/>
                <button onClick={() => downloadFiles()}>download</button>
            </div>
        </>
     );
}

export default FileTransferPage;