import { io } from "socket.io-client"
import { IConnectedDevice } from "../shared/types/IConnectedDevice"
import { publicIpv4 } from "public-ip"
import { ITransferRequest } from "../shared/types/ITransferRequest"
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
                deviceName: deviceName,
                publicIPAdress: await publicIpv4(),
                userName: userName
            } 
            
            socket.emit("addConnectedDevice",deviceData)
        });

        socket.on("transferFileRequest",async(data:ITransferRequest)=>{
            tauriEmit.transferFileRequest(data);
        });

        return socket;

    }

}

export default new websocketService()