import { useEffect, useState } from 'react';
import { IFile } from '../../types/IFile';
import  styles from './DirectoryItem.module.scss';

function DirectoryItem({item,handleClick}: {item:IFile, handleClick: Function}) {

    function setIcon(){
        switch (item.file_type) {
            case "drive":
            case "folder":
            case "pdf":
            case "xslx":
            case "docx":
            case "svg":
                return item.file_type + '_icon.png'
            default:
                return 'file_icon.png'        }
    }

    function setFileTypeHidden(){
        if(item.file_type === "folder" || item.file_type === "drive") return "none"
        else return "block"
    }

    return (
        <button className={styles.directoryItem} onClick={() => {handleClick(item.file_path,item.file_name)}}>
            <div className={styles.imageContainer}>
                <img src={setIcon()} className={styles.itemImage}/>

            </div>
            <div className={styles.itemDetails}>
                 <p className={styles.fileName}>{item.file_name}</p>
                 <p className={styles.fileTypeText} style={{display:setFileTypeHidden()}}>{item.file_type}</p>
            </div>
           
        </button>
    );
}

export default DirectoryItem;