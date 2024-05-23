import {useEffect, useState } from 'react';
import fileManagement from '../../../services/fileManagement';
import { IFile } from '../../types/IFile';
import  styles from './DirectoryItem.module.scss';

function DirectoryItem({item, selectedItems, setSelected,edit}: {item:IFile,selectedItems:IFile[],setSelected:Function,edit:boolean }) {
    const imageFileTypes = ["pdf","xslx","docx","svg", "folder","drive","Bin"]
    const [EditMode, setEditMode] = useState(edit)
    const [newFileName, setNewFileName] = useState("")
    function setIcon(){
        if(imageFileTypes.includes(item.extension)) return `/${item.extension}_icon.png`
        else return `/icon.png`

    }

    useEffect(() => {
        setEditMode(edit)
    }, [edit])

    function setFileTypeHidden(){
        if(item.extension === "folder" || item.extension === "drive") return "none"
        else return "block"
    }

    function createNewFile(){     

        let destructeredName = newFileName.split(".")
        
        if(destructeredName.length === 1){
            fileManagement.createFolder(item.path + "\\" + newFileName )
        } else if( destructeredName.length === 2){
            fileManagement.createFile(item.path + "\\", newFileName)
        } else{
            console.error("Invalid file name")
        }
    }

    function renameItem(){        
        let path = selectedItems[0].path.split("\\")
        path.pop()
        let parentDirectory = path.join("\\")
        fileManagement.renameItem(parentDirectory, selectedItems[0].name, newFileName)
    }

    function setSelectedClick(event:React.MouseEvent,item:IFile){
        if(item.edit) return
        setSelected(event,item)
    }   


    function updateItem(){
        try{
            console.log(item.extension !== "");
            
            if(!EditMode) return
            if(newFileName === "") return
            if(newFileName === item.name) return
            if(item.extension !== "")return renameItem()
            
            createNewFile()
        }catch(error){
            console.error(error)
        }
    }


    return (
        <button className={`${styles.directoryItem} ${selectedItems.some(selectedItem => selectedItem.name === item.name) ? styles.isSelectedItem : ""}`} onClick={(event) => setSelectedClick(event,item)} title={item.name}>
            <div className={styles.imageContainer}>
                <img src={setIcon()} className={styles.itemImage}/>
            </div>
            <div className={styles.itemDetails}>
                {(EditMode ?
                    <form onSubmit={(event) => {event.preventDefault(); updateItem()}}>
                        <input type="text" defaultValue={item.name} onChange={(event)  => {setNewFileName(event.currentTarget.value)}} onBlur={(event) => {event.preventDefault(); updateItem()}}/>
                    </form>
                     : 
                     <p className={styles.fileName}>{item.name}</p>)}
                 <div>
                 <p className={styles.fileTypeText} style={{display:setFileTypeHidden()}}>{item.size}</p>
                 </div>

            </div>
           
        </button>
    );
}

export default DirectoryItem;