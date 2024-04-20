import { useEffect, useState } from 'react';
import { IFile } from '../../types/IFile';
import  styles from './DirectoryItem.module.scss';

function DirectoryItem({item,handleClick}: {item:IFile, handleClick: Function}) {

    return (
        <button className={styles.directoryItem} onClick={() => {handleClick(item.file_path)}}>
            <img src={`${item.file_type}_icon.png`} className={styles.itemImage}/>
            <div className={styles.itemDetails}>
                 <p>{item.file_name}</p>
                <p>{item.file_type}</p>
            </div>
           
        </button>
    );
}

export default DirectoryItem;