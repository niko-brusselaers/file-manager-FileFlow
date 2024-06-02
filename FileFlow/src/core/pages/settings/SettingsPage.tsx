import React, { useEffect, useState } from 'react';
import styles from './SettingsPage.module.scss';
import themeManagement from '../../services/themeManagement';
import UpdateValueDialog from './updateValueDialog/UpdateValueDialog';

function SettingsPage() {
    const [name, setName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [deviceName, setDeviceName] = useState<string>("");
    const [theme, setTheme] = useState<string>(localStorage.getItem("theme") ? localStorage.getItem("theme") || "device" : "device");
    
    const [updateDialogOpened, setUpdateDialogOpened] = useState<boolean>(false);
    const [initialUpdateValue, setInitialUpdateValue] = useState<string>("");
    const [updateType, setUpdateType] = useState<string>("");

    useEffect(() => {
        localStorage.getItem("name") ? setName(localStorage.getItem("name") || "") : setName("")

        localStorage.getItem("email") ? setEmail(localStorage.getItem("email") || "") : setEmail("")

        localStorage.getItem("deviceName") ? setDeviceName(localStorage.getItem("deviceName") || "") : setDeviceName("")
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

                <div className={styles.settingsItem}>
                    <h3 className={styles.settingsItemTitle}>Email</h3>
                    <div>
                         <p className={styles.settingsItemText}>{email}</p>
                        <button onClick={(event) => {updateSettingsValue(event,"email")}}>Edit</button>
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