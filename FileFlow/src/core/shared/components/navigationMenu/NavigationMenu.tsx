import { useEffect } from "react";
import styles from "./NavigationMenu.module.scss"
import { Window } from '@tauri-apps/api/window';

  
function NavigationMenu() {
    const appWindow = new Window('main');

    useEffect(() => {
        
        
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

    
    return ( 
            <div data-tauri-drag-region className={styles.titlebar}>
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
     );
}

export default NavigationMenu;