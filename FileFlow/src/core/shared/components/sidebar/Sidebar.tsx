import { useEffect, useState } from 'react';
import styles from './Sidebar.module.scss';
import rustService from '../../../services/rustService';
import { IFile } from '../../types/IFile';
import { Link } from 'react-router-dom';
import { documentDir, downloadDir, homeDir, pictureDir } from '@tauri-apps/api/path';

function Sidebar() {
    const recentFolders = ["example1", "example2", "example3", "example4"]
    const favoriteFolders = ["example1", "example2", "example3", "example4"]
    const [drives, setDrives] = useState<IFile[]| undefined>();
    const [pictureDirectory, setPictureDirectory] = useState<IFile>();
    const [downloadDirectory, setDownloadDirectory] = useState<IFile>();
    const [documentDirectory, setDocumentDirectory] = useState<IFile>();
    const [homeDirectory, setHomeDirectory] = useState<IFile>();



    useEffect(() => {    
    if(drives === undefined){

        pictureDir().then((path) => setPictureDirectory({file_name: "Pictures", file_path: path, file_type: "folder"}))
        downloadDir().then((path) => setDownloadDirectory({file_name: "Download", file_path: path , file_type: "folder"}))
        documentDir().then((path) => setDocumentDirectory({file_name: "Documents", file_path: path, file_type: "folder"}))
        homeDir().then((path) => setHomeDirectory({file_name: "Home", file_path: path, file_type: "folder"}))
      
      rustService.getdrives().then((data) => {
        //check if data is undefined
        if(!data?.filesAndFolders && !data?.directoryPath) return;          

        //set files and folders and current path
        setDrives(data.filesAndFolders);
      }).catch((error) => {
        console.error("Error fetching drives:", error);
      });
    }
    });


    return ( 
        <div className={styles.sidebar}>
            <div className={styles.sidebarButtonGroup}>
                <Link className={styles.sidebarLink} title="Home" to={`/${homeDirectory?.file_name}`}  state={homeDirectory}>
                    <img src="/home_sidebar_icon.png"/>
                    <p>{homeDirectory?.file_name}</p>
                </Link>
                <Link className={styles.sidebarLink} title='Pictures' to={`/${pictureDirectory?.file_name}`} state={pictureDirectory}>
                    <img src="/picture_sidebar_icon.png"/>
                    <p>Pictures</p>
                </Link>
                <Link className={styles.sidebarLink} title='Download' to={`/${downloadDirectory?.file_name}`} state={downloadDirectory}>
                    <img src="/download_sidebar_icon.png"/>
                    <p>Download</p>
                </Link>
                <Link className={styles.sidebarLink} title='Documents' to={`/${documentDirectory?.file_name}`} state={documentDirectory}>
                    <img src="/file_sidebar_icon.png"/>
                    <p>Documents</p>
                </Link>
            </div>
            <div className={styles.sidebarButtonGroup}>
                <h2 className={styles.sidebarGroupTitle}>Recent</h2>
                {
                    recentFolders.map((folder, index) => {
                        return (
                            <button className={styles.sidebarLink} key={index} title={folder}>
                                <img src="/folder_sidebar_icon.png"/>
                                <p>{folder}</p>
                            </button>
                        )
                    })
                }
            </div>
            <div className={styles.sidebarButtonGroup}>
                <h2 className={styles.sidebarGroupTitle}>Favorites</h2>
                {
                    favoriteFolders.map((folder, index) => {
                        return (
                            <button className={styles.sidebarLink} key={index} title={folder}>
                                <img src="/folder_sidebar_icon.png"/>
                                <p>{folder}</p>
                            </button>
                        )
                    })
                }
            </div>
            <div className={styles.sidebarButtonGroup}>
                <h2 className={styles.sidebarGroupTitle}>Drives</h2>
                {
                     drives?.map((drive, index) => {
                        return (
                            <Link className={styles.sidebarLink} key={index} to={"/folderView"} state={drive} title={drive.file_name}>
                                <img src="/drive_sidebar_icon.png"/>
                                <p>{drive.file_name}</p>
                            </Link>
                        )
                    })
                }
            </div>

        </div>
     );
}

export default Sidebar;