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
import CssFilterConverter from "css-filter-converter";




function App() {
  const [transferSendDialogOpen, setTransferSendDialogOpen] = useState<boolean>(false);
  const [transferHubDialogOpen, setTransferHubDialogOpen] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<IFile[]|null>(null);
  const [webSocketServer, setWebSocketServer] = useState<any>(null);

  useEffect(() => {

    //set the default theme based on the system theme
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    console.log(mediaQuery);
    
    if(mediaQuery.matches){
      document.documentElement.style.setProperty('--background', '#172241');
      document.documentElement.style.setProperty('--tertiary', '#313D5F');
      document.documentElement.style.setProperty('--text', '#FFFFFF');

      //convert the hex color to css filter color
      let iconColor = CssFilterConverter.hexToFilter("#FFFFFF").color
      let whiteIconColor = CssFilterConverter.hexToFilter("#FFFFFF").color

      document.documentElement.style.setProperty('--icon', iconColor);
      document.documentElement.style.setProperty('--whiteIcon', whiteIconColor);
    } else {
      document.documentElement.style.setProperty('--background', '#F5F5F8');
      document.documentElement.style.setProperty('--tertiary', '#E3E3E3');
      document.documentElement.style.setProperty('--text', '#000000');

      //convert the hex color to css filter color
      let iconColor = CssFilterConverter.hexToFilter("#000000").color
      let whiteIconColor = CssFilterConverter.hexToFilter("#FFFFFF").color
      
      document.documentElement.style.setProperty('--icon', iconColor);
      document.documentElement.style.setProperty('--whiteIcon', whiteIconColor);
      
    }
    

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

    invoke("get_device_name").then((data) => {
      tauriStore.setKeyToLocalFile("credentials.bin","userName",data)
      tauriStore.setKeyToLocalFile("credentials.bin","deviceName",data)
    })

    webSocketService.connectToWebsocket("https://fileflow-backend.onrender.com/")
    .then((data) => {setWebSocketServer(data)})
    .catch((error) => {throw Error(error)});
    

  },[])


  return (
    <>
      <NavigationMenu />
      <ContextMenu/>
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
