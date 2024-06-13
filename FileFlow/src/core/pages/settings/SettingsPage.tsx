import React, { useEffect, useState } from 'react';
import styles from './SettingsPage.module.scss';
import themeManagement from '../../services/themeManagement';
import UpdateValueDialog from './updateValueDialog/UpdateValueDialog';
import ConfirmationDialog from './confirmationDialog/ConfirmationDialog';
import tauriEmit from '../../services/tauriEmit';
import tauriStore from '../../services/tauriStore';

function SettingsPage() {
    const [name, setName] = useState<string>("");
    const [deviceName, setDeviceName] = useState<string>("");
    const [theme, setTheme] = useState<string>();
    const [searchLimit, setSearchLimit] = useState<string>("");
    const [errorLogging, setErrorLogging] = useState<string>("");
    
    const [updateDialogOpened, setUpdateDialogOpened] = useState<boolean>(false);
    const [confirmationDialogOpened, setConfimationDialogOpened] = useState<boolean>(false);
    const [initialUpdateValue, setInitialUpdateValue] = useState<string>("");
    const [updateType, setUpdateType] = useState<string>("");
    const [warningMessage, setWarningMessage] = useState<string>("");

    useEffect(() => {
        setName(localStorage.getItem("name") || "")

        setDeviceName(localStorage.getItem("deviceName") || "")

        setTheme(localStorage.getItem("theme") || "device")

        setSearchLimit(localStorage.getItem("searchLimit") || "1000")

        setErrorLogging(localStorage.getItem("errorLogging") || "false")
    },[])


    function handleThemeChange(event:React.ChangeEvent<HTMLSelectElement>){
        setTheme(event.target.value);
        localStorage.setItem("theme", event.target.value);     
        themeManagement.checkTheme();   
    }

    function updateSettingsValue(event:React.MouseEvent,type: string){
        event.preventDefault();
        setUpdateType(type);
        switch(type){
            case "name":
                setInitialUpdateValue(name);
                setUpdateDialogOpened(true);
                break;
            case "email":
                console.log("currently not supported");   
                setUpdateDialogOpened(true);
                break;
            case "device name":
                setInitialUpdateValue(deviceName);
                setUpdateDialogOpened(true);
                break;
            case "search limit":
                setInitialUpdateValue(searchLimit);
                setUpdateDialogOpened(true);
                setWarningMessage("putting a high number may crash the app, use with caution");
                break;
            case "recent items":
                setConfimationDialogOpened(true);
                setWarningMessage("Are you sure you want to clear recent items?");
                break;
            case "favorite items":
                setConfimationDialogOpened(true);
                setWarningMessage("Are you sure you want to clear favorite items?");
                break;
            case "file transfers":
                setConfimationDialogOpened(true);
                setWarningMessage("Are you sure you want to clear file transfers?");
                break;
            case "file transfers Request":
                setConfimationDialogOpened(true);
                setWarningMessage("Are you sure you want to clear file transfers Requests?");
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
            case "device name":
                setDeviceName(newValue);
                localStorage.setItem("deviceName",newValue);
                break;
            case "search limit":
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

    function clearCache(type: string){
        //TODO: clear cache based on type
        console.log("clearing cache",type);
        switch(type){
            case "recent items":
                localStorage.setItem("recentItems", "[]");
                tauriEmit.emitUpdateRecent();
                break;
            case "favorite items":
                localStorage.setItem("favoriteItems", "[]");
                tauriEmit.emitUpdateFavorite();
                break;
            case "file transfers":
                tauriStore.clearLocalFile("fileTransfers.bin")
                break;
            case "file transfers request":
                tauriStore.clearLocalFile("fileTransfersRequests.bin")
                break;
            default:
                console.error(type,"not supported");
        }
    }

    function handleErrorLoggingChange(event:React.ChangeEvent<HTMLSelectElement>){
        setErrorLogging(event.target.value);
        localStorage.setItem("errorLogging",event.target.value);
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
            <ConfirmationDialog
                confirmationDialogOpened={confirmationDialogOpened}
                setConfimationDialogOpened={setConfimationDialogOpened}
                warningMessage={warningMessage}
                setWarningMessage={setWarningMessage}
                updateType={updateType}
                clearCache={clearCache}
            />
            <h2 className={styles.directoryName}>Settings</h2>

            <h3 className={styles.settingsCategoryHeader}>Personal information</h3>
            <div className={styles.CategoryContainer}>

                <div className={styles.settingsItem}>
                    <h4 className={styles.settingsItemTitle}>Name</h4>
                    <div>
                         <p className={styles.settingsItemText}>{name}</p>
                        <button onClick={(event) => {updateSettingsValue(event,"name")}}>Edit</button>
                    </div>
                </div>
            </div>

            <h3 className={styles.settingsCategoryHeader}>General Settings</h3>
            <div className={styles.CategoryContainer}>
                <div className={styles.settingsItem}>
                    <h4 className={styles.settingsItemTitle}>Device name</h4>
                    <div>
                         <p className={styles.settingsItemText}>{deviceName}</p>
                        <button onClick={(event) => {updateSettingsValue(event,"device name")}}>Edit</button>
                    </div>
                </div>
                <div className={styles.settingsItem}>
                    <h4 className={styles.settingsItemTitle}>Search Limit</h4>
                    <div>
                         <p className={styles.settingsItemText}>{searchLimit}</p>
                        <button onClick={(event) => {updateSettingsValue(event,"search limit")}}>Edit</button>
                    </div>
                </div>
                <div className={styles.settingsItem}>
                    <h4 className={styles.settingsItemTitle}>Theme</h4>
                    <div>
                        <select className={styles.settingsItemSelect} value={theme} onChange={handleThemeChange}>
                            <option value={"light"}>Light</option>
                            <option value={"dark"}>Dark</option>
                            <option value={"device"}>Device preference</option>
                        </select>
                    </div>
                </div>
            </div>
            <h3 className={styles.settingsCategoryHeader}>Cache Settings</h3>
            <div className={styles.CategoryContainer}>

                <div className={styles.settingsItem}>
                    <h4 className={styles.settingsItemTitle}>Recent items</h4>
                    <div>
                        <button className={styles.clearOption} onClick={event => updateSettingsValue(event,"recent items")}>Clear recent items</button>
                    </div>
                </div>
                <div className={styles.settingsItem}>
                    <h4 className={styles.settingsItemTitle}>Favorite items</h4>
                    <div>
                        <button className={styles.clearOption} onClick={event => updateSettingsValue(event,"favorite items")}>Clear favorite items</button>
                    </div>
                </div>
                <div className={styles.settingsItem}>
                    <h4 className={styles.settingsItemTitle}>File transfers</h4>
                    <div>
                        <button className={styles.clearOption} onClick={event => updateSettingsValue(event,"file transfers")}>Clear file transfers</button>
                    </div>
                </div>
                <div className={styles.settingsItem}>
                    <h4 className={styles.settingsItemTitle}>File transfers Request</h4>
                    <div>
                        <button className={styles.clearOption} onClick={event => updateSettingsValue(event,"file tranfsers request")}>Clear file transfers Requests</button>
                    </div>
                </div>
                
            </div>
            <h3 className={styles.settingsCategoryHeader}>Advanced Settings</h3>
            <div className={styles.CategoryContainer}>
                <div className={styles.settingsItem}>
                    <h4 className={styles.settingsItemTitle}>developer error logging</h4>
                    <div>
                        <select className={styles.settingsItemSelect} value={errorLogging} onChange={handleErrorLoggingChange}>
                            <option value={"true"}>Enabled</option>
                            <option value={"false"}>Disabled</option>
                        </select>
                    </div>
                </div>
            </div>
        </div> 
    
    );
}

export default SettingsPage;