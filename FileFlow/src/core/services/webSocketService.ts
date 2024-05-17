import { Socket, io } from "socket.io-client"
import { IConnectedDevice } from "../shared/types/IConnectedDevice"
import { publicIpv4 } from "public-ip"
import { ITransferRequest } from "../shared/types/ITransferRequest"
import tauriStore from "./tauriStore"
import { ask } from "@tauri-apps/plugin-dialog"
import fileTransfer from "./fileTransfer"
 
class websocketService{

    async connectToWebsocket(socketURL: string){
        const socket = io(socketURL,{
            autoConnect:true,
            reconnection: true,
        });
        
        socket.connect();

        socket.on("connect", async () => {
            
            let deviceData:IConnectedDevice
            let deviceName = await tauriStore.readKeyFromLocalFile<string>("credentials.bin","deviceName").then((data) => data).catch((error) => {throw Error(error)});
            let userName = await tauriStore.readKeyFromLocalFile<string>("credentials.bin","userName").then((data) => data).catch((error) => {throw Error(error)});

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
            ask(`Do you want to accept the file transfer request from ${data.fileDetails.fileName}?`).then(async(response) => {
                if(response){
                    await fileTransfer.downloadFiles(data.code)
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