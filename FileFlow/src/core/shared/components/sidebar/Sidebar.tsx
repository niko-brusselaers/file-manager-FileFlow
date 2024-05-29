import { useEffect, useRef, useState } from 'react';
import styles from './Sidebar.module.scss';
import { IFile } from '../../types/IFile';
import { Link } from 'react-router-dom';
import { documentDir, downloadDir, homeDir, pictureDir } from '@tauri-apps/api/path';
import fileManagement from '../../../services/fileManagement';
import { listen } from '@tauri-apps/api/event';
import tauriEmit from '../../../services/tauriEmit';
import { IContextMenuData } from '../../types/IContextMenuData';

function Sidebar() {
    const [recentFolders,setRecentFolders] = useState<IFile[]>([]);
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
        console.log(recentFolders);
        
        listen("recentFolderChange", getRecentFolders);
        
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

    function getRecentFolders(){
        let folders = JSON.parse(localStorage.getItem("recentFolders") || '[]') as IFile[];
        //removes first element from the array
        if(folders.length) folders.shift();

        setRecentFolders(folders);
        return folders
    }

    function handleContextMenuFavoriteClick(event:React.MouseEvent,item:IFile){
        event.preventDefault();
        event.stopPropagation();
        if(!item) return;
        let data:IContextMenuData = {
            selectedItems: [item],
            position: {x:event.clientX, y:event.clientY},
            contextType: 'sidebarFavourite'
        }

        tauriEmit.emitContextMenuOpen(data);
    
    }

    function handleContextMenuSideBarFolderClick(event:React.MouseEvent,item?:IFile){
        event.preventDefault();
        event.stopPropagation();
        if(!item) return;
        let data:IContextMenuData = {
            selectedItems: [item],
            position: {x:event.clientX, y:event.clientY},
            contextType: 'sideBarFolder'
        }

        tauriEmit.emitContextMenuOpen(data);
    }

    function handleSideBarDivContextMenuClick(event:React.MouseEvent){
        event.preventDefault();
        event.stopPropagation();
        let data:IContextMenuData = {
            selectedItems: [],
            position: {x:event.clientX, y:event.clientY},
            contextType: 'sideBar'
        }

        tauriEmit.emitContextMenuOpen(data);
    }

    return ( 
        <div onContextMenu={handleSideBarDivContextMenuClick} className={styles.sidebar}>
            <div className={styles.sidebarButtonGroup}>
                <Link className={styles.sidebarLink} title="Home" to={`/${homeDirectory?.name}`}  state={homeDirectory} onContextMenu={event => handleContextMenuSideBarFolderClick(event,homeDirectory)}>
                    <img src="/dist/home_sidebar_icon.png"/>
                    <p>{homeDirectory?.name}</p>
                </Link>
                <Link className={styles.sidebarLink} title='Pictures' to={`/${pictureDirectory?.name}`} state={pictureDirectory} onContextMenu={event => handleContextMenuSideBarFolderClick(event,pictureDirectory)}>
                    <img src="/dist/picture_sidebar_icon.png"/>
                    <p>Pictures</p>
                </Link>
                <Link className={styles.sidebarLink} title='Download' to={`/${downloadDirectory?.name}`} state={downloadDirectory} onContextMenu={event => handleContextMenuSideBarFolderClick(event,downloadDirectory)}>
                    <img src="/dist/download_sidebar_icon.png"/>
                    <p>Download</p>
                </Link>
                <Link className={styles.sidebarLink} title='Documents' to={`/${documentDirectory?.name}`} state={documentDirectory} onContextMenu={event => handleContextMenuSideBarFolderClick(event,documentDirectory)}>
                    <img src="/dist/folder_sidebar_icon.png"/>
                    <p>Documents</p>
                </Link>
            </div>
            <div className={styles.sidebarButtonGroup}>
                <h2 className={styles.sidebarGroupTitle}>Recent</h2>
                {
                    recentFolders.map((folder, index) => {
                        return (
                            <Link className={styles.sidebarLink} key={index} title={folder.name} to={`/${folder.name}`} state={folder} onContextMenu={event => handleContextMenuSideBarFolderClick(event,folder)}>
                                <img src="/dist/folder_sidebar_icon.png"/>
                                <p>{folder.name}</p>
                            </Link>
                        )
                    })
                }
            </div>
            <div className={styles.sidebarButtonGroup}>
                <h2 className={styles.sidebarGroupTitle}>Favorites</h2>
                {
                    favoriteFolders.map((folder, index) => {
                        return (
                            <Link className={styles.sidebarLink} onContextMenu={event => handleContextMenuFavoriteClick(event,folder)} key={index} to={`${folder.name}`} state={folder} title={folder.name}>
                                <img src="/dist/folder_sidebar_icon.png"/>
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
                                <img src="/dist/drive_sidebar_icon.png"/>
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