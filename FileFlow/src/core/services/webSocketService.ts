import { Socket, io } from "socket.io-client"
import { IConnectedDevice } from "../shared/types/IConnectedDevice"
import { publicIpv4 } from "public-ip"
import { ITransferRequest } from "../shared/types/ITransferRequest"
import tauriStore from "./tauriStore"
import { ask } from "@tauri-apps/plugin-dialog"
import fileTransfer from "./fileTransfer"
import { downloadDir } from "@tauri-apps/api/path"
 
class websocketService{

    async connectToWebsocket(socketURL: string,deviceName:string){
        const socket = io(socketURL,{
            autoConnect:true,
            reconnection: true,
        });
        
        socket.connect();

        socket.on("connect", async () => {
            
            let deviceData:IConnectedDevice
            deviceData = {
                socketId: socket.id as string,
                deviceName: deviceName,
                publicIPAdress: await publicIpv4(),
                userName: await tauriStore.readKeyFromLocalFile<string>("credentials.bin","userName").then((data) => data).catch((error) => {throw Error(error)})
            } 
            
            socket.emit("addConnectedDevice",deviceData)
        });

        socket.on("transferFileRequest",(data:ITransferRequest)=>{
            console.log(data);
            ask(`Do you want to accept the file transfer request from ${data.fileDetails.fileName}?`).then(async(response) => {
                if(response){
                    fileTransfer.downloadFiles(data.code,await downloadDir())
                }
            })
        });

        return socket;

    }

    sendFileRequest(socket:Socket,data:ITransferRequest){
        //return error if no socketId, userName or code is provided or empty
        if(!data.socketId && !data.userName) throw new Error("socketId or userName is required");
        
        if(!data.code) throw new Error("code is required");
        
        socket.emit("transferFileRequest",data);
    }
}

export default new websocketService()