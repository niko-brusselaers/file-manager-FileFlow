import { SyntheticEvent, useEffect, useState } from "react";
import styles from "./NavigationMenu.module.scss"
import { Window } from '@tauri-apps/api/window';
import { Navigate, useLocation,useNavigate } from "react-router-dom";
import { IFile } from "../../types/IFile";
import rustService from "../../../services/rustService";

  
function NavigationMenu() {
    const appWindow = new Window('main');
    const locationData:IFile = useLocation().state;
    const navigate = useNavigate()
    const [filePathInput, setFilePathInput] = useState<string>(locationData?.file_name ||  "This Device");

    useEffect(() => {
        
        // Set the --navBarHeight variable to the height of the titlebar
        setNavBarHeightVariable();
        window.addEventListener('resize', () => setNavBarHeightVariable());

    },[])


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
        console.log(filePathInput);
        
        await rustService.checkPathIsValid(filePathInput).then((type) => {
            console.log(type);
            
            switch (type) {
                case "File":
                    rustService.openFile(filePathInput);
                    break;
                case "Folder":
                    let filepathName = filePathInput.split("\\")
                    navigate(`/`, {state: {file_name:filepathName[filepathName.length-1] , file_path: filePathInput, file_type: "File", file_size: ""}})
                    break;
                case "":
                default:
                    console.log("invalid");
                    setFilePathInput(locationData.file_name)
                    break;
            }
            
        })
    }


    return ( 
            <div data-tauri-drag-region className={styles.titlebar}>
                <div className={styles.navBarTopContainer}>
                    <div className={styles.windowsOptionsContainer}>
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
                        <button className={styles.navigationMenuButton}><img className={styles.backArrow} src="/arrow.png" alt="back" /></button>
                        <button className={styles.navigationMenuButton}><img className={styles.forwardArrow} src="/arrow.png" alt="forward" /></button>
                        <button className={styles.navigationMenuButton}><img className={styles.downArrow} src="/arrow.png" alt="" /></button>
                    </div>
                    <form onSubmit={(event)=>{navigateToPath(event)}} className={styles.navigationPathInput}>
                    <input  type="text"  
                            value={filePathInput} 
                            onClick={() => {showFullPath()}}
                            onBlur={() => {showPathName()}}
                            onChange={(event) => {setFilePathInput(event.currentTarget.value)}}
                            />
                    </form>
                    <form className={styles.searchInput} >
                        <input type="text" placeholder="Search This pc"/>

                    </form>
                    <div  className={styles.drownDownMenu}>
                        <img src="/acount_icon.png" alt="" />
                    </div>
                </div>
                
            </div>
     );
}

export default NavigationMenu;