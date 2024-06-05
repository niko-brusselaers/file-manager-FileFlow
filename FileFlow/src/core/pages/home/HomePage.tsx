import { useEffect, useRef, useState } from "react";
import styles from "./HomePage.module.scss";
import { IFile } from "../../shared/types/IFile";
import DirectoryItemTile from "../../shared/components/directoryItem/directoryItemTile/DirectoryItemTile";
import { listen } from "@tauri-apps/api/event";
import DirectoryItemDetail from "../../shared/components/directoryItem/directoryItemDetail/DirectoryItemDetail";
import ContainerDetailViewTop from "../../shared/components/containerDetailViewTop/ContainerDetailViewTop";
import fileManagement from "../../services/fileManagement";
import tauriEmit from "../../services/tauriEmit";
import { IContextMenuData } from "../../shared/types/IContextMenuData";
import conversion from "../../services/conversion";

function HomePage() {
    const [favoriteFolders, setFavoriteFolders] = useState<IFile[]>([]);
    const [recentItems, setRecentItems] = useState<{file:IFile,count:number}[]>([]);
    const [selectedItemFavorites, setSelectedItemFavorites] = useState<IFile>({name: "", path: "",created:new Date(),modified:new Date(),hidden:false, extension: "", size: "", edit: false});
    const [selectedItemRecent, setSelectedItemRecent] = useState<IFile>({name: "", path: "",created:new Date(),modified:new Date(),hidden:false, extension: "", size: "", edit: false});

    const favoritesContainerRef = useRef<HTMLDivElement>(null);
    const recentContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {

        listen("updateFavorites", updateFavoriteItems);

        listen("recentItemChange", updateRecentItems);

        // retrieve favorite and recent items from local storage
        updateFavoriteItems();
        updateRecentItems();

    },[]);
    
    function setSelected(event:React.MouseEvent,item: IFile) {    
    
        if(favoritesContainerRef.current?.contains(event.target as Node)) {
            setSelectedItemRecent({name: "", path: "",created:new Date(),modified:new Date(),hidden:false, extension: "", size: "", edit: false});
            setSelectedItemFavorites(item);
        }
        if(recentContainerRef.current?.contains(event.target as Node)){
            setSelectedItemFavorites({name: "", path: "",created:new Date(),modified:new Date(),hidden:false, extension: "", size: "", edit: false});
            setSelectedItemRecent(item);
        };
    };

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
        setRecentItems(recentItems);
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
        setFavoriteFolders(favoriteItems);
    }

    // Define the scroll event handler outside of the listenForScroll function
    const handleScroll = (event: WheelEvent) => {
        
        if(!favoritesContainerRef.current?.contains(event.target as Node)) return;
        event.stopPropagation();
        favoritesContainerRef.current?.scrollBy({left: event.deltaY * 0.25});
    };

    // Add the event listener
    function listenForScroll(event:React.MouseEvent<HTMLDivElement>){
        event.preventDefault();
        window.addEventListener("wheel", handleScroll);
    }

    // Remove the event listener
    function stopListenForScroll(){
        window.removeEventListener("wheel", handleScroll);
    }

    function handleContextMenu(event:React.MouseEvent<HTMLDivElement, MouseEvent>){
    event.preventDefault();
    event.stopPropagation();
    const target = event.target as HTMLElement;
    console.log(selectedItemFavorites, selectedItemRecent);
    
    let selectedItem = selectedItemFavorites.name !== "" ? selectedItemFavorites : selectedItemRecent;
    if(selectedItem.name === "") return;

    let data:IContextMenuData = {
        selectedItems: [selectedItem],
        position:{
            x:event.clientX, 
            y:event.clientY
        },
        contextType : "none"
      }

    if(target.className === styles.favoritesContainer || target.className === styles.recentContainer || target.className === styles.homePageView || target.className === styles.HomePageTitle) data.contextType = "none"
    if(selectedItemFavorites.name !== "") data.contextType = "homePageFavorite"
    if(selectedItemRecent.name !== "") data.contextType = "homePageRecent"

    tauriEmit.emitContextMenuOpen(data)
  }
    
    return ( 
    <div onContextMenu={handleContextMenu} className={styles.homePageView}>
        <h2 className={styles.HomePageTitle}>Favorites</h2>
        <div className={styles.favoritesContainer} ref={favoritesContainerRef} onMouseEnter={listenForScroll} onMouseLeave={stopListenForScroll}>
            {favoriteFolders.map((folder,index) => {
                return (
                    <DirectoryItemTile
                        item={folder}
                        edit={false}
                        setSelected={setSelected}
                        selectedItems={[selectedItemFavorites]}
                        key={index}/>
                )
            })}
        </div>
        <h2 className={styles.HomePageTitle}>Recent</h2>
        <div className={styles.recentContainer} ref={recentContainerRef}>
            <ContainerDetailViewTop/>
            {recentItems.map((folder,index) => {
                return (
                    <DirectoryItemDetail
                        item={folder.file}
                        edit={false}
                        setSelected={setSelected}
                        selectedItems={[selectedItemRecent]}
                        key={index}/>
                )
            })}
        </div>
    </div> );
}

export default HomePage;