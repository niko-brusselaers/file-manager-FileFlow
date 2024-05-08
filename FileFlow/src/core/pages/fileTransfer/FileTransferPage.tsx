import { useEffect, useState } from 'react';
import styles from './FileTransferPage.module.scss';
import { open } from "@tauri-apps/plugin-dialog"
import rustService from '../../services/rustService';

function FileTransferPage({dialogOpened, setDialogOpened}:{dialogOpened: boolean, setDialogOpened: Function}) {
    const [inputFilePath, setInputFilePath] = useState<string | null>(null);
    const [code, setCode] = useState<string| null>(null);
    const [contact] = useState<string[]| null>([
        "example1@email.com",
        "example2@email.com",
        "example3@email.com",
        "example4@email.com"]);
    const [recent] = useState<string[]| null>([
        "recentEx@mail.com",
        "recentEx2@mail.com",
        "recentEx3@mail.com",]);
    const [devices] = useState<string[]| null>([
        "device1",
        "device2",
        "device3",
        "device4"
    ]);


    async function openDialog() {
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
        <div className={dialogOpened ? styles.fileTransferDialog : styles.hidden}>
            <div className={styles.filetransferViewSend}>
                <div>
                    <h2>file name</h2>
                    <p>file size</p>
                </div>
                <div>
                    <h2>Share this file</h2>
                    <input type="text"  placeholder='enter email' className={styles.inputForm}/>
                    <div className={styles.usersContainer}>
                        {contact?.map((email, index) => <button className={styles.receiver} key={index}>{email}</button>)}
                    </div>
                </div>
                <div>
                    <h2>own devices</h2>
                    <div>
                        {devices?.map((device, index) => <button className={styles.receiver} key={index}>{device}</button>)}    
                    </div>
                </div>
                <div>
                    <h2>Recent</h2>
                    <div>
                        {recent?.map((email, index) => <button className={styles.receiver} key={index}>{email}</button>)}
                    </div>
                </div>
                <div>
                    <button className={styles.otherShareOptionButton}>other</button>
                </div>
                <div className={styles.dialogButtonsBottomContainer}>
                    <button>Share</button>
                    <button onClick={() => {setDialogOpened(false)}}>Cancel</button>
                </div>

                
            </div>

            {/* <div className={styles.filetransferView}>
                <input type="text" onChange={(event) =>{setCode(event.currentTarget.value)} }/>
                <button onClick={() => downloadFiles()}>download</button>
            </div> */}
        </div>
     );
}

export default FileTransferPage;