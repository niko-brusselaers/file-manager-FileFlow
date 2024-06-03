import { useEffect, useState } from 'react';
import styles from './Sidebar.module.scss';
import { IFile } from '../../types/IFile';
import { Link } from 'react-router-dom';
import { documentDir, downloadDir, pictureDir } from '@tauri-apps/api/path';
import fileManagement from '../../../services/fileManagement';
import { listen } from '@tauri-apps/api/event';
import tauriEmit from '../../../services/tauriEmit';
import { IContextMenuData } from '../../types/IContextMenuData';

function Sidebar() {
    const [recentFolders,setRecentFolders] = useState<IFile[]>([]);
    const [favoriteFolders, setFavoriteFolders] = useState<IFile[]>([]);
    const [drives, setDrives] = useState<IFile[]| undefined>();
    const [pictureDirectory, setPictureDirectory] = useState<IFile>();
    const [downloadDirectory, setDownloadDirectory] = useState<IFile>();
    const [documentDirectory, setDocumentDirectory] = useState<IFile>();
    const HomePage = {name: "Home", path: "",created:new Date(),modified:new Date(),hidden:false, extension: "folder", size: "", edit: false};


    useEffect(() => {
        setSideBarWidthVar();
        window.addEventListener('resize', setSideBarWidthVar);
        listen("updateFavorites", () => {
            const favoriteFoldersLS = JSON.parse(localStorage.getItem("favoriteItems") || '[]') as IFile[];
            const folders = favoriteFoldersLS.filter((folder:IFile) => folder.extension === "folder");
            setFavoriteFolders(folders);
        });
        
        listen("recentItemChange", getRecentFolders);

        const favoriteFoldersLS = JSON.parse(localStorage.getItem("favoriteItems") || '[]') as IFile[];
        const folders = favoriteFoldersLS.filter((folder:IFile) => folder.extension === "folder");
        
        setFavoriteFolders(folders);
        getRecentFolders();
        
    },[]);

    useEffect(() => {    
    if(drives === undefined){

        pictureDir().then((path) => setPictureDirectory({name: "Pictures", path: path,created:new Date(),modified:new Date(),hidden:false, extension: "folder", size: "", edit: false}))
        downloadDir().then((path) => setDownloadDirectory({name: "Download", path: path, created:new Date(),modified:new Date(),hidden:false, extension: "folder", size: "", edit: false}))
        documentDir().then((path) => setDocumentDirectory({name: "Documents", path: path,created:new Date(),modified:new Date(),hidden:false, extension: "folder", size: "", edit: false}))
      
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
        let items = JSON.parse(localStorage.getItem("recentItems") || '[]') as {file:IFile,count:number}[];

        //only return last 5 items from highest count
        let folders = items.sort((a,b) => b.count - a.count).map((folder) => folder.file).slice(0,5);
        
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
            contextType: 'none'
        }

        tauriEmit.emitContextMenuOpen(data);
    }

    return ( 
        <div onContextMenu={handleSideBarDivContextMenuClick} className={styles.sidebar}>
            <div className={styles.sidebarButtonGroup}>
                <Link className={styles.sidebarLink} title="Home" to={`/`} state={HomePage}  onContextMenu={event => handleContextMenuSideBarFolderClick(event,HomePage)}>
                    <img src="/home_sidebar_icon.png"/>
                    <p>Home</p>
                </Link>
                <Link className={styles.sidebarLink} title='Pictures' to={`/${pictureDirectory?.name}`} state={pictureDirectory} onContextMenu={event => handleContextMenuSideBarFolderClick(event,pictureDirectory)}>
                    <img src="/picture_sidebar_icon.png"/>
                    <p>Pictures</p>
                </Link>
                <Link className={styles.sidebarLink} title='Download' to={`/${downloadDirectory?.name}`} state={downloadDirectory} onContextMenu={event => handleContextMenuSideBarFolderClick(event,downloadDirectory)}>
                    <img src="/download_sidebar_icon.png"/>
                    <p>Download</p>
                </Link>
                <Link className={styles.sidebarLink} title='Documents' to={`/${documentDirectory?.name}`} state={documentDirectory} onContextMenu={event => handleContextMenuSideBarFolderClick(event,documentDirectory)}>
                    <img src="/folder_sidebar_icon.png"/>
                    <p>Documents</p>
                </Link>
            </div>
            <div className={styles.sidebarButtonGroup}>
                <h2 className={styles.sidebarGroupTitle}>Recent</h2>
                {
                    recentFolders.map((folder, index) => {
                        return (
                            <Link className={styles.sidebarLink} key={index} title={folder.name} to={`/${folder.name}`} state={folder} onContextMenu={event => handleContextMenuSideBarFolderClick(event,folder)}>
                                <img src="/folder_sidebar_icon.png"/>
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