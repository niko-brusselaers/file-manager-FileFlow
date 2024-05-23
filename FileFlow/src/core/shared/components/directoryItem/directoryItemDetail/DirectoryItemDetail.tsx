import {useEffect, useState } from 'react';
import  styles from './DirectoryItemDetail.module.scss';
import fileManagement from '../../../../services/fileManagement';
import { IFile } from '../../../types/IFile';

function DirectoryItemDetail({item, selectedItems, setSelected,edit}: {item:IFile,selectedItems:IFile[],setSelected:Function,edit:boolean }) {
    const imageFileTypes = ["pdf","xslx","docx","svg", "folder","drive","Bin"]
    const [EditMode, setEditMode] = useState(edit)
    const [newFileName, setNewFileName] = useState("")
    function setIcon(){
        if(imageFileTypes.includes(item.extension)) return `/${item.extension}_icon.png`
        else return `/file_icon.png`

    }

    useEffect(() => {
        setEditMode(edit)
    }, [edit])

    function showFileSize(){
        if(item.extension === "folder") return ""
        else return item.size
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
        <button className={`${styles.directoryItemDetail} ${selectedItems.some(selectedItem => selectedItem.name === item.name) ? styles.isSelectedItem : ""}`} onClick={(event) => setSelectedClick(event,item)} title={item.name}>
            <div className={styles.imageContainer}>
                <img src={setIcon()} className={styles.itemImage}/>
            </div>
            <div className={styles.itemDetails}>
                <div className={styles.itemName}>
                    {(EditMode ?
                        <form onSubmit={(event) => {event.preventDefault(); updateItem()}}>
                            <input type="text" defaultValue={item.name} onChange={(event)  => {setNewFileName(event.currentTarget.value)}} onBlur={(event) => {event.preventDefault(); updateItem()}}/>
                        </form>
                        : 
                        <p className={styles.fileName}>{item.name}</p>)}
                
                </div>
                 <p className={styles.fileTypeText} >{item.extension}</p>
                 <p className={styles.fileTypeText} >{showFileSize()}</p>
                 <p className={styles.fileTypeText} >{item.created.toString()}</p>

            </div>
           
        </button>
    );
}

export default DirectoryItemDetail;