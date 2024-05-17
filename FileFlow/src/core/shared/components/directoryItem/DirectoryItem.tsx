import {useEffect, useState } from 'react';
import fileManagement from '../../../services/fileManagement';
import { IFile } from '../../types/IFile';
import  styles from './DirectoryItem.module.scss';

function DirectoryItem({item, selectedItem, handleClick,newItem}: {item:IFile,selectedItem:IFile,handleClick:Function,newItem:boolean }) {
    const imageFileTypes = ["pdf","xslx","docx","svg", "folder","drive","Bin"]
    const [isNewItem, setIsNewItem] = useState(newItem)
    function setIcon(){
        if(imageFileTypes.includes(item.file_type)) return `/${item.file_type}_icon.png`
        else return `/file_icon.png`

        
    }

    useEffect(() => {
        setIsNewItem(newItem)
    }, [newItem])

    function setFileTypeHidden(){
        if(item.file_type === "folder" || item.file_type === "drive") return "none"
        else return "block"
    }

    function createNewFile(){
        console.log(newItem);
        
        if(newItem === false) return
        setIsNewItem(false)
        let destructeredName = item.file_name.split(".")
        if(destructeredName.length === 1){
            fileManagement.createFolder(item.file_path + "\\" + item.file_name )
        } else if( destructeredName.length === 2){
            fileManagement.createFile(item.file_path + "\\", item.file_name)
        } else{
            console.error("Invalid file name")
        }
    }

    function handleItemClick(item:IFile){
        if(item.newItem) return

        handleClick(item)
    }   


    return (
        <button className={`${styles.directoryItem} ${selectedItem.file_name === item.file_name ? styles.isSelectedItem : ""}`} onClick={() => handleItemClick(item)} title={item.file_name}>
            <div className={styles.imageContainer}>
                <img src={setIcon()} className={styles.itemImage}/>
            </div>
            <div className={styles.itemDetails}>
                {(isNewItem ?
                    <form onSubmit={(event) => {event.preventDefault();createNewFile()}}>
                        <input type="text" defaultValue={item.file_name} onChange={(event)  => {item.file_name = event.currentTarget.value}} onBlur={(event) => {event.preventDefault(); createNewFile()}}/>
                    </form>
                     : 
                     <p className={styles.fileName}>{item.file_name}</p>)}
                 <div>
                 <p className={styles.fileTypeText} style={{display:setFileTypeHidden()}}>{item.file_size}</p>
                 </div>

            </div>
           
        </button>
    );
}

export default DirectoryItem;