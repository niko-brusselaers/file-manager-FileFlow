import React, { useEffect, useState } from 'react';
import styles from './SettingsPage.module.scss';
import themeManagement from '../../services/themeManagement';
import UpdateValueDialog from './updateValueDialog/UpdateValueDialog';

function SettingsPage() {
    const [name, setName] = useState<string>("");
    const [deviceName, setDeviceName] = useState<string>("");
    const [theme, setTheme] = useState<string>();
    const [searchLimit, setSearchLimit] = useState<string>("");
    
    const [updateDialogOpened, setUpdateDialogOpened] = useState<boolean>(false);
    const [initialUpdateValue, setInitialUpdateValue] = useState<string>("");
    const [updateType, setUpdateType] = useState<string>("");
    const [warningMessage, setWarningMessage] = useState<string>("");

    useEffect(() => {
        setName(localStorage.getItem("name") || "")

        setDeviceName(localStorage.getItem("deviceName") || "")

        setTheme(localStorage.getItem("theme") || "device")

        setSearchLimit(localStorage.getItem("searchLimit") || "1000")
    },[])


    function handleThemeChange(event:React.ChangeEvent<HTMLSelectElement>){
        setTheme(event.target.value);
        localStorage.setItem("theme", event.target.value);     
        themeManagement.checkTheme();   
    }

    function updateSettingsValue(event:React.MouseEvent,type: string){
        event.preventDefault();
        setUpdateType(type);
        setUpdateDialogOpened(true);
        switch(type){
            case "name":
                setInitialUpdateValue(name);

                break;
            case "email":
                console.log("currently not supported");
                
                break;
            case "deviceName":
                setInitialUpdateValue(deviceName);
                break;
            case "searchLimit":
                setInitialUpdateValue(searchLimit);
                setWarningMessage("putting a high number may crash the app, use with caution");
                break;
            default:
                console.error(type,"not supported");
                
        }
    }

    function updateSettingsItem(newValue: string){
        try {
            switch(updateType){
            case "name":
                setName(newValue);
                localStorage.setItem("name",newValue);
                break;
            case "email":
                console.log("currently not supported");
                break;
            case "deviceName":
                setDeviceName(newValue);
                localStorage.setItem("deviceName",newValue);
                break;
            case "searchLimit":
                setSearchLimit(newValue);
                localStorage.setItem("searchLimit",newValue);
                break;
            default:
                console.error(updateType,"not supported");
                break;
            }

            setUpdateDialogOpened(false);
        } catch (error) {
            
        }
    }

    


    return ( 
    
        <div className={styles.SettingsView}>
            <UpdateValueDialog 
                dialogOpened={updateDialogOpened} 
                setDialogOpened={setUpdateDialogOpened}  
                initialValue={initialUpdateValue} 
                warningMessage={warningMessage}
                setWarningMessage={setWarningMessage}
                updateType={updateType}
                updateValue={updateSettingsItem}/>

            <h2 className={styles.directoryName}>Settings</h2>

            <h3 className={styles.settingsCategoryHeader}>Personal information</h3>
            <div className={styles.CategoryContainer}>

                <div className={styles.settingsItem}>
                    <h3 className={styles.settingsItemTitle}>Name</h3>
                    <div>
                         <p className={styles.settingsItemText}>{name}</p>
                        <button onClick={(event) => {updateSettingsValue(event,"name")}}>Edit</button>
                    </div>
                </div>
            </div>

            <h3 className={styles.settingsCategoryHeader}>General Settings</h3>
            <div className={styles.CategoryContainer}>
                <div className={styles.settingsItem}>
                    <h3 className={styles.settingsItemTitle}>Device name</h3>
                    <div>
                         <p className={styles.settingsItemText}>{deviceName}</p>
                        <button onClick={(event) => {updateSettingsValue(event,"deviceName")}}>Edit</button>
                    </div>
                </div>
                <div className={styles.settingsItem}>
                    <h3 className={styles.settingsItemTitle}>Search Limit</h3>
                    <div>
                         <p className={styles.settingsItemText}>{searchLimit}</p>
                        <button onClick={(event) => {updateSettingsValue(event,"searchLimit")}}>Edit</button>
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