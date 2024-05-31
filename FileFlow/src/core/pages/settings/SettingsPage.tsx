import { useEffect, useState } from 'react';
import styles from './SettingsPage.module.scss';
import tauriStore from '../../services/tauriStore';
import themeManagement from '../../services/themeManagement';

function SettingsPage() {
    const [name, setName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [deviceName, setDeviceName] = useState<string>("");
    const [theme, setTheme] = useState<string>(localStorage.getItem("theme") ? localStorage.getItem("theme") || "device" : "device");

    useEffect(() => {
        tauriStore.readKeyFromLocalFile("credentials.bin","userName").then((data) => {
            if(typeof data !== "string") return;
            setName(data);
        })

        tauriStore.readKeyFromLocalFile("credentials.bin","email").then((data) => {
            if(typeof data !== "string") return;
            setEmail(data);
        })

        tauriStore.readKeyFromLocalFile("credentials.bin","deviceName").then((data) => {
            if(typeof data !== "string") return;
            setDeviceName(data);
        })

        console.log(theme);
        
    },[])


    function handleThemeChange(event:React.ChangeEvent<HTMLSelectElement>){
        setTheme(event.target.value);
        localStorage.setItem("theme", event.target.value);     
        themeManagement.checkTheme();   
    }


    return ( 
    
        <div className={styles.SettingsView}>
            <h2 className={styles.directoryName}>Settings</h2>

            <h3 className={styles.settingsCategoryHeader}>Personal information</h3>
            <div className={styles.CategoryContainer}>

                <div className={styles.settingsItem}>
                    <h3 className={styles.settingsItemTitle}>Name</h3>
                    <div>
                         <p className={styles.settingsItemText}>{name}</p>
                        <button>Edit</button>
                    </div>
                </div>

                <div className={styles.settingsItem}>
                    <h3 className={styles.settingsItemTitle}>Email</h3>
                    <div>
                         <p className={styles.settingsItemText}>{email}</p>
                        <button>Edit</button>
                    </div>
                </div>
            </div>

            <h3 className={styles.settingsCategoryHeader}>General Settings</h3>
            <div className={styles.CategoryContainer}>
                <div className={styles.settingsItem}>
                    <h3 className={styles.settingsItemTitle}>Device name</h3>
                    <div>
                         <p className={styles.settingsItemText}>{deviceName}</p>
                        <button>Edit</button>
                    </div>
                </div>
                <div className={styles.settingsItem}>
                    <h3 className={styles.settingsItemTitle}>Theme</h3>
                    <div>
                        <select className={styles.settingsItemSelect} defaultValue={theme} onChange={handleThemeChange}>
                            <option value={"light"}>Light</option>
                            <option value={"dark"}>Dark</option>
                            <option value={"device"}>Device preference</option>
                        </select>
                    </div>
                </div>
            </div>
        </div> 
    
    );
}

export default SettingsPage;