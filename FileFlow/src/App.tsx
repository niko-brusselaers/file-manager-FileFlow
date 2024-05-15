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


function App() {
  const [transferSendDialogOpen, setTransferSendDialogOpen] = useState<boolean>(false);
  const [transferHubDialogOpen, setTransferHubDialogOpen] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<IFile|null>(null);
  const [webSocketServer, setWebSocketServer] = useState<any>(null);

  useEffect(() => {

    //listen if the file sent event is triggered and open the file transfer dialog
    listen("sendFile", (event) => {
      let file = (event.payload as any).file as IFile;
      setSelectedItem(file);
      setTransferSendDialogOpen(true);
    });

    //listen if the open file transfer hub event is triggered and open the file transfer hub dialog
    listen("openFileTransferHub", () => {
      setTransferHubDialogOpen(true);
    });
    tauriStore.setKeyToLocalFile("credentials.bin","userName","DeskNiko")

    webSocketService.connectToWebsocket("94.110.26.98:3000","Des")
    .then((data) => setWebSocketServer(data))
    .catch((error) => {throw Error(error)});
    

  },[])


  

  return (
    <>
      <NavigationMenu/>
      <div className="applicationContainer">
        <FileTransferSend dialogOpened={transferSendDialogOpen} setDialogOpened={setTransferSendDialogOpen} websocket={webSocketServer}  selectedItem={selectedItem}/>
        <FileTransferHub dialogOpened={transferHubDialogOpen} setDialogOpened={setTransferHubDialogOpen}/>
        <FileTransferProgress />
        <Sidebar />
        <Outlet/>
      </div>
    </>
  )
}

export default App;
