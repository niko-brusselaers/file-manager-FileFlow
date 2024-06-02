import { SyntheticEvent, useEffect, useRef, useState } from "react";
import styles from "./NavigationMenu.module.scss"
import { Window } from '@tauri-apps/api/window';
import { Link, useLocation,useNavigate } from "react-router-dom";
import { IFile } from "../../types/IFile";
import { emit } from "@tauri-apps/api/event";
import fileManagement from "../../../services/fileManagement";

  
function NavigationMenu() {
    const navigate = useNavigate()
    const locationData:IFile = useLocation().state;
    const appWindow = Window.getCurrent();
    const dropDownMenuRef = useRef<HTMLDivElement>(null);
    const setingsData = {name: "Settings", path: "",created:new Date(),modified:new Date(),hidden:false, extension: "", size: "", edit: false}
    let timeoutID: NodeJS.Timeout | null = null;

    const [filePathInput, setFilePathInput] = useState<string>("");
    const [dropDownBarIsOpen, setDropDownBarIsOpen] = useState<boolean>(false);

    useEffect(() => {
        // Set the --navBarHeight variable to the height of the titlebar
        setNavBarHeightVariable();
        window.addEventListener('resize', setNavBarHeightVariable);

        //close the dropdown bar when the user clicks outside of the dropdown bar
        document.addEventListener("mousedown", (event) => {
            //classnames of the elements that should not close the dropdown bar
            if(dropDownMenuRef.current?.contains(event.target as Node)) return
            else setDropDownBarIsOpen(false);
            
        })

    },[])

    //update the file path input when the location data changes
    useEffect(() => {
        if(locationData) return setFilePathInput(locationData?.name)
        else return setFilePathInput("Home")
    },[locationData])

    function minimizeWindow() {
        appWindow.minimize();
    }

    function maximizeWindow() {
        appWindow.toggleMaximize();
    }

    function closeWindow() {
        appWindow.close();
    }

    function handleDropDownClick(){
        if(timeoutID) clearTimeout(timeoutID);
        setDropDownBarIsOpen(true);
    }

    function handleDropDownMenuLeave(){
        timeoutID = setTimeout(() => {
            setDropDownBarIsOpen(false);
        }, 100);
    }

    function setNavBarHeightVariable() {
            // Set the --navBarHeight variable to the height of the titlebar
            let navBarHeight = document.querySelector("."+styles.titlebar)?.clientHeight;
            document.documentElement.style.setProperty('--navBarHeight', navBarHeight + "px");
    };

    function showFullPath(){
        setFilePathInput(locationData?.path)
    }

    function showPathName(){
        setFilePathInput(locationData?.name)
    }

    async function navigateToPath(event:SyntheticEvent){
        event.preventDefault();
        
        //check if path is valid, if it is a folder navigate to the folder, if it is a file open the file
        await fileManagement.checkPathIsValid(filePathInput).then((fileOrFolder) => {            
            if(fileOrFolder?.extension === "" || !fileOrFolder) return
            else if(fileOrFolder?.extension ==="folder") return navigate(`/${fileOrFolder.name}`, {state: fileOrFolder})
            else fileManagement.openFile(fileOrFolder.path)
            
            
        })
    }

    function searchDirectory(event:React.ChangeEvent<HTMLInputElement>){
        //emit an event to search the directory
        emit("searchDirectory", event.currentTarget.value)
    }

    function searchDevice(query:string){
        navigate(`/search/${query}`, {state: query})
    }

    //navigate to parent folder
    async function navigateToParentFolder(){
        
        let directoryPathArray = locationData?.path.split("\\");
        directoryPathArray = directoryPathArray.filter((path) => path !== "")
        let parentDirectory

        const deviceRoot:IFile= {
            name: "My Device",
            path: "",
            size: "",
            created: new Date(),
            modified: new Date(),
            hidden: false,
            extension: "folder", 
            edit: false
        }

        //if directory path is equals or less than 1 navigate to device root
        if(directoryPathArray.length <= 1) return navigate(`/${deviceRoot.name}`, {state: deviceRoot,replace: true})
        else if(directoryPathArray.length === 2) parentDirectory = directoryPathArray[0].toLowerCase() + "\\"
        else parentDirectory = directoryPathArray.slice(0,directoryPathArray.length-1).join("\\")
        console.log(directoryPathArray);        

        await fileManagement.checkPathIsValid(parentDirectory).then((fileOrFolder) => {            
            if(fileOrFolder?.extension === "" || !fileOrFolder) return
            else if(fileOrFolder?.extension ==="folder") return navigate(`/${fileOrFolder.name}`, {state: fileOrFolder,replace: true})
            else fileManagement.openFile(fileOrFolder.path)
        })
        
    }


    function openFileTransferHub(){
        emit("openFileTransferHub", {});
        setDropDownBarIsOpen(false);
    }


    return ( 
            <div onContextMenu={(event) => {event.preventDefault()}}  className={styles.titlebar}>
                <div  className={styles.navBarTopContainer}>
                    <div data-tauri-drag-region className={styles.windowsOptionsContainer}>
                        <button className={styles.titlebarButton} onClick={() => minimizeWindow()}>
                            <img
                            src="https://api.iconify.design/mdi:window-minimize.svg"
                            alt="minimize"
                            />
                        </button>
                        <button className={styles.titlebarButton} id="titlebar-maximize" onClick={() => maximizeWindow()}>
                            <img
                            src="https://api.iconify.design/mdi:window-maximize.svg"
                            alt="maximize"
                            />
                        </button>
                        <button className={styles.titlebarButton} id="titlebar-close" onClick={() => closeWindow()}>
                            <img src="https://api.iconify.design/mdi:close.svg" alt="close" />
                        </button>
                    </div>
                </div>
                <div className={styles.navBarBottomContainer}>
                    <div className={styles.navigationMenuContainer}>
                        <button className={styles.navigationMenuButton}><img className={styles.backArrow} src="/arrow.png" alt="back" onClick={() => {history.back()}}/></button>
                        <button className={styles.navigationMenuButton}><img className={styles.forwardArrow} src="/arrow.png" alt="forward" onClick={() => {history.forward()}}/></button>
                        <button className={styles.navigationMenuButton}><img className={styles.downArrow} src="/arrow.png" alt="" onClick={async () => {await navigateToParentFolder()}}/></button>
                    </div>
                    <form onSubmit={(event)=>{navigateToPath(event)}} className={styles.navigationPathInput}>
                    <input  type="text"
                        className={styles.navigationInput}  
                        value={filePathInput || ""} 
                        onClick={() => {showFullPath()}}
                        onBlur={() => {showPathName()}}
                        onChange={(event) => {setFilePathInput(event.currentTarget.value)}}
                    />
                    </form>
                    <form className={styles.searchInput} >
                        <input className={styles.navigationInput}  type="text" placeholder="Search This pc" onChange={searchDirectory} onKeyDown={(event) => {if (event.key === 'Enter') {event.preventDefault();searchDevice(event.currentTarget.value);}}}/>

                    </form>
                    <div ref={dropDownMenuRef} className={styles.drownDownMenu}  onMouseLeave={handleDropDownMenuLeave}>
                        <img className={styles.dropdownMenuImage} src="/acount_icon.png" alt=""  onClick={handleDropDownClick}/>
                        <div className={styles.dropDownMenuContainer} style={dropDownBarIsOpen ? {display:"block"} : {display:"none"}}>
                            <button className={styles.dropDownMenuButton} onClick={() => {openFileTransferHub()}}>
                                File Transfer
                            </button>
                            <Link className={styles.dropDownMenuButton} to={`/settings`} state={setingsData}>
                                Settings
                            </Link>
                        </div>
                    </div>
                </div>
                
            </div>
     );
}

export default NavigationMenu;