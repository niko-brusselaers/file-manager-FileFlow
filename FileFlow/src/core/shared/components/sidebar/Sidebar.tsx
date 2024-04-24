import { useEffect, useState } from 'react';
import styles from './Sidebar.module.scss';
import rustService from '../../../services/rustService';
import { IFile } from '../../types/IFile';

function Sidebar() {
    const recentFolders = ["example1", "example2", "example3", "example4"]
    const favoriteFolders = ["example1", "example2", "example3", "example4"]
    const [drives, setDrives] = useState<IFile[]| undefined>();

    useEffect(() => {
      console.log("test1");

    if(drives === undefined){
      console.log("test2");
      
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
                <button className={styles.sidebarButton} title='Home'>
                    <img src="home_sidebar_icon.png"/>
                    <p>Home</p>
                </button>
                <button className={styles.sidebarButton} title='Pictures'>
                    <img src="picture_sidebar_icon.png"/>
                    <p>Pictures</p>
                </button>
                <button className={styles.sidebarButton} title='Download'>
                    <img src="download_sidebar_icon.png"/>
                    <p>Download</p>
                </button>
                <button className={styles.sidebarButton} title='Documents'>
                    <img src="file_sidebar_icon.png"/>
                    <p>Documents</p>
                </button>
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
                            <button className={styles.sidebarButton} key={index} title={drive.file_name}>
                                <img src="drive_sidebar_icon.png"/>
                                <p>{drive.file_name}</p>
                            </button>
                        )
                    })
                }
            </div>

        </div>
     );
}

export default Sidebar;