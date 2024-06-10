import { ITransferProgress } from "./ITransferProgress"
import { ITransferRequest } from "./ITransferRequest"

export interface INotificationData {
    type: "error" | "fileTransferRequest" |"fileTransferStarted" | "FileTransferProgress" | "fileTransferSuccess" | "moveProgress" | "copyProgress" | "message"
    transferProgress?: ITransferProgress
    transferRequest?: ITransferRequest
    error?: string
    message?: string
    
} 