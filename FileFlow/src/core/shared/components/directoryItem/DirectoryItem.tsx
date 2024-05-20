import {useEffect, useState } from 'react';
import fileManagement from '../../../services/fileManagement';
import { IFile } from '../../types/IFile';
import  styles from './DirectoryItem.module.scss';

function DirectoryItem({item, selectedItems, setSelected,edit}: {item:IFile,selectedItems:IFile[],setSelected:Function,edit:boolean }) {
    const imageFileTypes = ["pdf","xslx","docx","svg", "folder","drive","Bin"]
    const [EditMode, setEditMode] = useState(edit)
    const [newFileName, setNewFileName] = useState("")
    function setIcon(){
        if(imageFileTypes.includes(item.file_type)) return `/${item.file_type}_icon.png`
        else return `/file_icon.png`

    }

    useEffect(() => {
        setEditMode(edit)
    }, [edit])

    function setFileTypeHidden(){
        if(item.file_type === "folder" || item.file_type === "drive") return "none"
        else return "block"
    }

    function createNewFile(){     

        let destructeredName = newFileName.split(".")
        
        if(destructeredName.length === 1){
            fileManagement.createFolder(item.file_path + "\\" + newFileName )
        } else if( destructeredName.length === 2){
            fileManagement.createFile(item.file_path + "\\", newFileName)
        } else{
            console.error("Invalid file name")
        }
    }

    function renameItem(){        
        let file_path = selectedItems[0].file_path.split("\\")
        file_path.pop()
        let parentDirectory = file_path.join("\\")
        fileManagement.renameItem(parentDirectory, selectedItems[0].file_name, newFileName)
    }

    function setSelectedClick(event:React.MouseEvent,item:IFile){
        if(item.edit) return
        setSelected(event,item)
    }   


    function updateItem(){
        try{
            console.log(item.file_type !== "");
            
            if(!EditMode) return
            if(newFileName === "") return
            if(newFileName === item.file_name) return
            if(item.file_type !== "")return renameItem()
            
            createNewFile()
        }catch(error){
            console.error(error)
        }
    }


    return (
        <button className={`${styles.directoryItem} ${selectedItems.some(selectedItem => selectedItem.file_name === item.file_name) ? styles.isSelectedItem : ""}`} onClick={(event) => setSelectedClick(event,item)} title={item.file_name}>
            <div className={styles.imageContainer}>
                <img src={setIcon()} className={styles.itemImage}/>
            </div>
            <div className={styles.itemDetails}>
                {(EditMode ?
                    <form onSubmit={(event) => {event.preventDefault(); updateItem()}}>
                        <input type="text" defaultValue={item.file_name} onChange={(event)  => {setNewFileName(event.currentTarget.value)}} onBlur={(event) => {event.preventDefault(); updateItem()}}/>
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