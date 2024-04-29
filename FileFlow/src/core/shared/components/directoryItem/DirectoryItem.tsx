import { useNavigate } from 'react-router-dom';
import rustService from '../../../services/rustService';
import { IFile } from '../../types/IFile';
import  styles from './DirectoryItem.module.scss';

function DirectoryItem({item,isDirectory = false}: {item:IFile,isDirectory?:boolean}) {
    const imageFileTypes = ["pdf","xslx","docx","svg", "folder","drive","Bin"]
    const navigate = useNavigate();
    function setIcon(){
        if(imageFileTypes.includes(item.file_type)) return `/${item.file_type}_icon.png`
        else return `/file_icon.png`

        
    }

    function setFileTypeHidden(){
        if(item.file_type === "folder" || item.file_type === "drive") return "none"
        else return "block"
    }

    function handleFileClick(){
        if(isDirectory){
            console.log("Navigating to folder");
            navigate(`/folderView`,{
                state: item
            })
        } else{
            rustService.openFile(item.file_path);
        }
    }

    return (
        <button className={styles.directoryItem} onClick={(() => handleFileClick())} title={item.file_name}>
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