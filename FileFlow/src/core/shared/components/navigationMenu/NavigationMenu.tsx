import { SyntheticEvent, useEffect, useState } from "react";
import styles from "./NavigationMenu.module.scss"
import { Window } from '@tauri-apps/api/window';
import { useLocation,useNavigate } from "react-router-dom";
import { IFile } from "../../types/IFile";
import { emit } from "@tauri-apps/api/event";
import fileManagement from "../../../services/fileManagement";

  
function NavigationMenu() {
    const appWindow = Window.getCurrent();
    const locationData:IFile = useLocation().state;
    const navigate = useNavigate()
    const [filePathInput, setFilePathInput] = useState<string>(locationData?.file_name || "");
    const [dropDownBarIsOpen, setDropDownBarIsOpen] = useState<boolean>(false);

    useEffect(() => {
        // Set the --navBarHeight variable to the height of the titlebar
        setNavBarHeightVariable();
        window.addEventListener('resize', () => setNavBarHeightVariable());

        //close the dropdown bar when the user clicks outside of the dropdown bar
        document.addEventListener("mousedown", (event) => {
            //classnames of the elements that should not close the dropdown bar
            const dropDownTargets = [
                document.querySelector("."+styles.dropDownMenuContainer)?.className,
                document.querySelector("."+styles.dropDownMenuButton)?.className,
                document.querySelector("."+styles.dropdownMenuImage)?.className
            ]            
            //get the class name of the selected element
            let selectedClasname = (event.target as HTMLElement).className as string;                
                
            if(!dropDownTargets.includes(selectedClasname)) {
                setDropDownBarIsOpen(false)
            }
            
        })

    },[])

    //update the file path input when the location data changes
    useEffect(() => {
        setFilePathInput(locationData?.file_name)
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

    function setNavBarHeightVariable() {
            // Set the --navBarHeight variable to the height of the titlebar
            let navBarHeight = document.querySelector("."+styles.titlebar)?.clientHeight;
            document.documentElement.style.setProperty('--navBarHeight', navBarHeight + "px");
    };

    function showFullPath(){
        setFilePathInput(locationData?.file_path)
    }

    function showPathName(){
        setFilePathInput(locationData?.file_name)
    }

    async function navigateToPath(event:SyntheticEvent){
        event.preventDefault();
        
        //check if path is valid, if it is a folder navigate to the folder, if it is a file open the file
        await fileManagement.checkPathIsValid(filePathInput).then((fileOrFolder) => {            
            if(fileOrFolder?.file_type === "" || !fileOrFolder) return
            else if(fileOrFolder?.file_type ==="folder") return navigate(`/${fileOrFolder.file_name}`, {state: fileOrFolder})
            else fileManagement.openFile(fileOrFolder.file_path)
            
            
        })
    }

    //navigate to parent folder
    async function navigateToParentFolder(){
        
        let directoryPathArray = locationData?.file_path.split("\\");
        directoryPathArray = directoryPathArray.filter((path) => path !== "")
        let parentDirectory

        const deviceRoot:IFile= {
            file_name: "My Device",
            file_path: "",
            file_size: "",
            file_type: "folder"
        }

        //if directory path is equals or less than 1 navigate to device root
        if(directoryPathArray.length <= 1) return navigate(`/${deviceRoot.file_name}`, {state: deviceRoot,replace: true})
        else if(directoryPathArray.length === 2) parentDirectory = directoryPathArray[0].toLowerCase() + "\\"
        else parentDirectory = directoryPathArray.slice(0,directoryPathArray.length-1).join("\\")
        console.log(directoryPathArray);        

        await fileManagement.checkPathIsValid(parentDirectory).then((fileOrFolder) => {            
            if(fileOrFolder?.file_type === "" || !fileOrFolder) return
            else if(fileOrFolder?.file_type ==="folder") return navigate(`/${fileOrFolder.file_name}`, {state: fileOrFolder,replace: true})
            else fileManagement.openFile(fileOrFolder.file_path)
        })
        
    }

    async function ToggleDropDownBar(){
        setDropDownBarIsOpen(!dropDownBarIsOpen)
        if(!dropDownBarIsOpen){
        }
    }

    function openFileTransferHub(){
        emit("openFileTransferHub", {});
        setDropDownBarIsOpen(false);
    }


    return ( 
            <div  className={styles.titlebar}>
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
                        value={filePathInput || ""} 
                        onClick={() => {showFullPath()}}
                        onBlur={() => {showPathName()}}
                        onChange={(event) => {setFilePathInput(event.currentTarget.value)}}
                    />
                    </form>
                    <form className={styles.searchInput} >
                        <input type="text" placeholder="Search This pc"/>

                    </form>
                    <div  className={styles.drownDownMenu}>
                        <img className={styles.dropdownMenuImage} src="/acount_icon.png" alt="" onClick={() => {ToggleDropDownBar()}} />
                        <div className={styles.dropDownMenuContainer} style={dropDownBarIsOpen ? {display:"block"} : {display:"none"}}>
                            <button className={styles.dropDownMenuButton} onClick={() => {openFileTransferHub()}}>
                                File Transfer
                            </button>
                        </div>
                    </div>
                </div>
                
            </div>
     );
}

export default NavigationMenu;