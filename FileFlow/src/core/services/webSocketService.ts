import { Socket, io } from "socket.io-client"
import { IConnectedDevice } from "../shared/types/IConnectedDevice"
import { publicIpv4 } from "public-ip"
import { ITransferRequest } from "../shared/types/ITransferRequest"
import { ask } from "@tauri-apps/plugin-dialog"
import fileTransfer from "./fileTransfer"
import tauriEmit from "./tauriEmit"
 
class websocketService{

    async connectToWebsocket(socketURL: string){
        const socket = io(socketURL,{
            autoConnect:true,
            reconnection: true,
        });
        
        socket.connect();

        socket.on("connect", async () => {
            
            let deviceData:IConnectedDevice
            
            let userName = localStorage.getItem("name") || "";
            let deviceName = localStorage.getItem("deviceName") || "unkown device";

            deviceData = {
                socketId: socket.id as string,
                deviceName: deviceName || "Unknown Device",
                publicIPAdress: await publicIpv4(),
                userName: userName
            } 
            
            socket.emit("addConnectedDevice",deviceData)
        });

        socket.on("transferFileRequest",async(data:ITransferRequest)=>{
            console.log(data);
            tauriEmit.transferFileRequest(data);
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