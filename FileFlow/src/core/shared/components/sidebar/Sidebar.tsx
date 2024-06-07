import { useEffect, useState } from 'react';
import styles from './Sidebar.module.scss';
import { IFile } from '../../types/IFile';
import { Link } from 'react-router-dom';
import { documentDir, downloadDir, pictureDir } from '@tauri-apps/api/path';
import fileManagement from '../../../services/fileManagement';
import { listen } from '@tauri-apps/api/event';
import tauriEmit from '../../../services/tauriEmit';
import { IContextMenuData } from '../../types/IContextMenuData';
import conversion from '../../../services/conversion';

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
        listen("updateFavorites", updateFavoriteItems);
        
        listen("recentItemChange", updateRecentItems);

        updateFavoriteItems();
        updateRecentItems();
        
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

    // Function to update local storage and state for recent items
    async function updateRecentItems() {
        let items = JSON.parse(localStorage.getItem("recentItems") || '[]') as {file:IFile,count:number}[];
        
        let updatedItems = await Promise.all(items.map(async (item) => {
            let file = await fileManagement.checkPathIsValid(item.file.path);
            if(!file) return 
            file.size = await conversion.convertFileSizeIdentifier(parseInt(file.size));
            return {file:file,count:item.count};    
        }));

        // Filter out invalid items (i.e., items where the file is undefined)
        updatedItems = updatedItems.filter(item => item !== undefined);

        //if changes, update local storage
        if(updatedItems.length !== items.length){
            localStorage.setItem("recentItems", JSON.stringify(updatedItems));
        }

        // Ensure that updatedItems is an array of {file:IFile,count:number}
        var recentItems = updatedItems as {file:IFile,count:number}[];

        //filter out items that are not folders or drives
        recentItems = recentItems.filter((item) => item.file.extension === "folder" || item.file.extension === "drive");

        //only return last 5 items from highest count
        let folders = items.sort((a,b) => b.count - a.count).map((folder) => folder.file).slice(0,5);
        
        setRecentFolders(folders);
    }

    // Function to update local storage and state for favorite items
    async function updateFavoriteItems() {
        let items = JSON.parse(localStorage.getItem("favoriteItems") || '[]') as IFile[];
        
        let updatedItems = await Promise.all(items.map(async (item) => {
            let file = await fileManagement.checkPathIsValid(item.path);
            if(file) return file;
        }));

        // Filter out invalid items (i.e., items where the file is undefined)
        updatedItems = updatedItems.filter(item => item !== undefined);

        updatedItems = updatedItems.map((item) => {
            if(item?.size) item.size = conversion.convertFileSizeIdentifier(parseInt(item.size));
            return item;
        });
        //if changes, update local storage
        if(updatedItems.length !== items.length){
            localStorage.setItem("favoriteItems", JSON.stringify(updatedItems));
        }

        // Ensure that updatedItems is an array of IFile
        let favoriteItems = updatedItems as IFile[];

        //filter out items that are not folders or drives
        favoriteItems = favoriteItems.filter((item) => item.extension === "folder" || item.extension === "drive");

        
        setFavoriteFolders(favoriteItems);
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

    function handleContextMenuRecentClick(event:React.MouseEvent,item:IFile){
        event.preventDefault();
        event.stopPropagation();
        if(!item) return;
        let data:IContextMenuData = {
            selectedItems: [item],
            position: {x:event.clientX, y:event.clientY},
            contextType: 'sidebarRecent'
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
                            <Link className={styles.sidebarLink} key={index} title={folder.name} to={`/${folder.name}`} state={folder} onContextMenu={event => handleContextMenuRecentClick(event,folder)}>
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