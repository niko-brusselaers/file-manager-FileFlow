import { useEffect, useState } from 'react';
import styles from './Sidebar.module.scss';
import rustService from '../../../services/rustService';
import { IFile } from '../../types/IFile';
import { Link } from 'react-router-dom';

function Sidebar() {
    const recentFolders = ["example1", "example2", "example3", "example4"]
    const favoriteFolders = ["example1", "example2", "example3", "example4"]
    const [drives, setDrives] = useState<IFile[]| undefined>();

    useEffect(() => {
        
    if(drives === undefined){
      
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
                <Link className={styles.sidebarButton} title='Home' to="/folderView" >
                    <img src="home_sidebar_icon.png"/>
                    <p>Home</p>
                </Link>
                <Link className={styles.sidebarButton} title='Pictures' to="/folderView">
                    <img src="picture_sidebar_icon.png"/>
                    <p>Pictures</p>
                </Link>
                <Link className={styles.sidebarButton} title='Download' to="/folderView/">
                    <img src="download_sidebar_icon.png"/>
                    <p>Download</p>
                </Link>
                <Link className={styles.sidebarButton} title='Documents' to="/folderView">
                    <img src="file_sidebar_icon.png"/>
                    <p>Documents</p>
                </Link>
            </div>
            <div className={styles.sidebarButtonGroup}>
                <h2 className={styles.sidebarGroupTitle}>Recent</h2>
                {
                    recentFolders.map((folder, index) => {
                        return (
                            <button className={styles.sidebarButton} key={index} title={folder}>
                                <img src="folder_sidebar_icon.png"/>
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
                            <button className={styles.sidebarButton} key={index} title={folder}>
                                <img src="folder_sidebar_icon.png"/>
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
                            <Link className={styles.sidebarButton} key={index} to={"/folderView"} state={drive} title={drive.file_name}>
                                <img src="drive_sidebar_icon.png"/>
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