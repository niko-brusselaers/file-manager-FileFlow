import { useEffect, useState } from 'react';
import styles from './Sidebar.module.scss';
import { IFile } from '../../types/IFile';
import { Link } from 'react-router-dom';
import { documentDir, downloadDir, homeDir, pictureDir } from '@tauri-apps/api/path';
import fileManagement from '../../../services/fileManagement';
import { listen } from '@tauri-apps/api/event';

function Sidebar() {
    const recentFolders = ["example1", "example2", "example3", "example4"]
    const [favoriteFolders, setFavoriteFolders] = useState<IFile[]>(localStorage.getItem("favoriteFolders") ? JSON.parse(localStorage.getItem("favoriteFolders") || '') : []);
    const [drives, setDrives] = useState<IFile[]| undefined>();
    const [pictureDirectory, setPictureDirectory] = useState<IFile>();
    const [downloadDirectory, setDownloadDirectory] = useState<IFile>();
    const [documentDirectory, setDocumentDirectory] = useState<IFile>();
    const [homeDirectory, setHomeDirectory] = useState<IFile>();

    useEffect(() => {
        setSideBarWidthVar();
        window.addEventListener('resize', setSideBarWidthVar);
        listen("updateFavorites", () => {
            setFavoriteFolders(JSON.parse(localStorage.getItem("favoriteFolders") || ''));
        });

        
    },[]);

    useEffect(() => {    
    if(drives === undefined){

        pictureDir().then((path) => setPictureDirectory({name: "Pictures", path: path,created:new Date(),modified:new Date(),hidden:false, extension: "folder", size: "", edit: false}))
        downloadDir().then((path) => setDownloadDirectory({name: "Download", path: path, created:new Date(),modified:new Date(),hidden:false, extension: "folder", size: "", edit: false}))
        documentDir().then((path) => setDocumentDirectory({name: "Documents", path: path,created:new Date(),modified:new Date(),hidden:false, extension: "folder", size: "", edit: false}))
        homeDir().then((path) => setHomeDirectory({name: "Home", path: path,created:new Date(),modified:new Date(),hidden:false, extension: "folder", size: "", edit: false}))
      
        fileManagement.getdrives().then((data) => {
            //check if data is undefined
            if(!data?.filesAndFolders && !data?.directoryPath) return;          

            //set files and folders and current path
            setDrives(data.filesAndFolders);
        }).catch((error) => {
            console.error("Error fetching drives:", error);
        });
    }
    });

     function setSideBarWidthVar() {
            // Set the --navBarHeight variable to the height of the titlebar
            let sideBarWidth = document.querySelector("."+styles.sidebar)?.clientWidth;
            document.documentElement.style.setProperty('--sideBarWidth', sideBarWidth + "px");
    };


    return ( 
        <div className={styles.sidebar}>
            <div className={styles.sidebarButtonGroup}>
                <Link className={styles.sidebarLink} title="Home" to={`/${homeDirectory?.name}`}  state={homeDirectory}>
                    <img src="/home_sidebar_icon.png"/>
                    <p>{homeDirectory?.name}</p>
                </Link>
                <Link className={styles.sidebarLink} title='Pictures' to={`/${pictureDirectory?.name}`} state={pictureDirectory}>
                    <img src="/picture_sidebar_icon.png"/>
                    <p>Pictures</p>
                </Link>
                <Link className={styles.sidebarLink} title='Download' to={`/${downloadDirectory?.name}`} state={downloadDirectory}>
                    <img src="/download_sidebar_icon.png"/>
                    <p>Download</p>
                </Link>
                <Link className={styles.sidebarLink} title='Documents' to={`/${documentDirectory?.name}`} state={documentDirectory}>
                    <img src="/folder_sidebar_icon.png"/>
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
                            <Link className={styles.sidebarLink} key={index} to={`${folder.name}`} state={folder} title={folder.name}>
                                <img src="/folder_sidebar_icon.png"/>
                                <p>{folder.name}</p>
                            </Link>
                        )
                    })
                }
            </div>
            <div className={styles.sidebarButtonGroup}>
                <h2 className={styles.sidebarGroupTitle}>Drives</h2>
                {
                     drives?.map((drive, index) => {
                        return (
                            <Link className={styles.sidebarLink} key={index} to={"/folderView"} state={drive} title={drive.name}>
                                <img src="/drive_sidebar_icon.png"/>
                                <p>{drive.name}</p>
                            </Link>
                        )
                    })
                }
            </div>

        </div>
     );
}

export default Sidebar;