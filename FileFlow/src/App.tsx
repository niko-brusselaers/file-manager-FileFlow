import { Outlet } from "react-router-dom";
import Sidebar from "./core/shared/components/sidebar/Sidebar";
import "./styles.scss";
import NavigationMenu from "./core/shared/components/navigationMenu/NavigationMenu";
import FileTransferSend from "./core/shared/components/fileTransfer/fileTransferSendOptions/FileTransferSend";
import { useEffect, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { IFile } from "./core/shared/types/IFile";
import FileTransferHub from "./core/shared/components/fileTransfer/fileTransferHub/FileTransferHub";
import FileTransferProgress from "./core/shared/components/fileTransfer/fileTransferProgress/FileTransferProgress";
import webSocketService from "./core/services/webSocketService";
import tauriStore from "./core/services/tauriStore";
import { invoke } from "@tauri-apps/api/core";
import ContextMenu from "./core/shared/components/contextMenu/ContextMenu";
import themeManagement from "./core/services/themeManagement";
import NotificationContainer from "./core/shared/components/notificationContainer/NotificationContainer";




function App() {
  const [transferSendDialogOpen, setTransferSendDialogOpen] = useState<boolean>(false);
  const [transferHubDialogOpen, setTransferHubDialogOpen] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<IFile[]|null>(null);
  const [webSocketServer, setWebSocketServer] = useState<any>(null);

  useEffect(() => {

    //listen if the file sent event is triggered and open the file transfer dialog
    listen("sendFile", (event) => {
      let file = (event.payload as any).file as IFile[];
      setSelectedItem(file);
      setTransferSendDialogOpen(true);
    });

    //listen if the open file transfer hub event is triggered and open the file transfer hub dialog
    listen("openFileTransferHub", () => {
      setTransferHubDialogOpen(true);
    });

    tauriStore.readKeyFromLocalFile("credentials.bin","userName")
    .then(async (data) => {
      if(data != null) return;
      let userName = await invoke("get_device_name")      
      if(userName != null) tauriStore.setKeyToLocalFile("credentials.bin","userName",userName)
      else tauriStore.setKeyToLocalFile("credentials.bin","userName","User")
    })

    let name = localStorage.getItem("name") ? localStorage.getItem("name") : "";
    let deviceName = localStorage.getItem("deviceName") ? localStorage.getItem("deviceName") : "";

    if(name === "") localStorage.setItem("name","User")
    if(deviceName === "") invoke("get_device_name").then((data) => {localStorage.setItem("deviceName",data as string)})

    webSocketService.connectToWebsocket("https://fileflow-backend.onrender.com/")
    .then((data) => {setWebSocketServer(data)})
    .catch((error) => {throw Error(error)});
    
    themeManagement.checkTheme();

  },[])


  return (
    <>
      <NavigationMenu />
      <ContextMenu/>
      <NotificationContainer/>
      <div className="applicationContainer">
        <FileTransferSend dialogOpened={transferSendDialogOpen} setDialogOpened={setTransferSendDialogOpen} websocket={webSocketServer}  selectedItems={selectedItem}/>
        <FileTransferHub dialogOpened={transferHubDialogOpen} setDialogOpened={setTransferHubDialogOpen}/>
        <FileTransferProgress />
        <Sidebar />
        <Outlet/>
      </div>
    </>
  )
}

export default App;
