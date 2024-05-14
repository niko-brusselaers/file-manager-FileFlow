import { IFile } from '../../types/IFile';
import  styles from './DirectoryItem.module.scss';

function DirectoryItem({item, selectedItem, handleClick}: {item:IFile,selectedItem:IFile,handleClick:Function}) {
    const imageFileTypes = ["pdf","xslx","docx","svg", "folder","drive","Bin"]
    function setIcon(){
        if(imageFileTypes.includes(item.file_type)) return `/${item.file_type}_icon.png`
        else return `/file_icon.png`

        
    }

    function setFileTypeHidden(){
        if(item.file_type === "folder" || item.file_type === "drive") return "none"
        else return "block"
    }



    return (
        <button className={`${styles.directoryItem} ${selectedItem.file_name === item.file_name ? styles.isSelectedItem : ""}`} onClick={(() => handleClick(item))} title={item.file_name}>
            <div className={styles.imageContainer}>
                <img src={setIcon()} className={styles.itemImage}/>
            </div>
            <div className={styles.itemDetails}>
                 <p className={styles.fileName}>{item.file_name}</p>
                 <div>
                 <p className={styles.fileTypeText} style={{display:setFileTypeHidden()}}>{item.file_size}</p>
                 </div>

            </div>
           
        </button>
    );
}

export default DirectoryItem;