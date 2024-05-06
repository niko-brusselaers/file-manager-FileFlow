import { useState } from 'react';
import styles from './FileTransferPage.module.scss';
import { open } from "@tauri-apps/plugin-dialog"
import rustService from '../../services/rustService';

function FileTransferPage() {
    const [inputFilePath, setInputFilePath] = useState<string | null>(null);

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

    return ( 
        <div className={styles.filetransferView}>
            <h1>FileTransferPage</h1>
            <button onClick={() => openDIalog()}>open</button>
            <button onClick={() => sentFiles()}>test</button>
        </div>
        
     );
}

export default FileTransferPage;