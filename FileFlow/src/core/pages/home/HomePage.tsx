import { useEffect, useRef, useState } from "react";
import styles from "./HomePage.module.scss";
import { IFile } from "../../shared/types/IFile";
import DirectoryItemTile from "../../shared/components/directoryItem/directoryItemTile/DirectoryItemTile";
import { listen } from "@tauri-apps/api/event";
import DirectoryItemDetail from "../../shared/components/directoryItem/directoryItemDetail/DirectoryItemDetail";
import ContainerDetailViewTop from "../../shared/components/containerDetailViewTop/ContainerDetailViewTop";

function HomePage() {
    const [favoriteFolders, setFavoriteFolders] = useState<IFile[]>(localStorage.getItem("favoriteFolders") ? JSON.parse(localStorage.getItem("favoriteFolders") || '') : []);
    const [recentItems, setRecentItems] = useState<IFile[]>(localStorage.getItem("recentItems") ? JSON.parse(localStorage.getItem("recentItems") || '') : []);
    const [selectedItemFavorites, setSelectedItemFavorites] = useState<IFile>({name: "", path: "",created:new Date(),modified:new Date(),hidden:false, extension: "", size: "", edit: false});
    const [selectedItemRecent, setSelectedItemRecent] = useState<IFile>({name: "", path: "",created:new Date(),modified:new Date(),hidden:false, extension: "", size: "", edit: false});

    const favoritesContainerRef = useRef<HTMLDivElement>(null);
    const recentContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {

        listen("updateFavorites", () => {
            setFavoriteFolders(JSON.parse(localStorage.getItem("favoriteFolders") || ''));
        });

    },[]);
    
    function setSelected(event:React.MouseEvent,item: IFile) {    
    
        if(event.type === "auxclick") return;
        if(favoritesContainerRef.current?.contains(event.target as Node)) {
            setSelectedItemRecent({name: "", path: "",created:new Date(),modified:new Date(),hidden:false, extension: "", size: "", edit: false});
            setSelectedItemFavorites(item);
        }
        if(recentContainerRef.current?.contains(event.target as Node)){
            setSelectedItemFavorites({name: "", path: "",created:new Date(),modified:new Date(),hidden:false, extension: "", size: "", edit: false});
            setSelectedItemRecent(item);
        };
    };

    // Define the scroll event handler outside of the listenForScroll function
    const handleScroll = (event: WheelEvent) => {
        favoritesContainerRef.current?.scrollBy({left: event.deltaY * 0.25});
    };

    // Add the event listener
    function listenForScroll(event:React.MouseEvent<HTMLDivElement>){
        window.addEventListener("wheel", handleScroll);
    }

    // Remove the event listener
    function stopListenForScroll(){
        window.removeEventListener("wheel", handleScroll);
    }
    
    return ( 
    <div className={styles.homePageView}>
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
                        item={folder}
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