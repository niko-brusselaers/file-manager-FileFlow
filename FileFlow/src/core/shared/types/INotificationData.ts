import { ITransferProgress } from "./ITransferProgress"
import { ITransferRequest } from "./ITransferRequest"

export interface INotificationData {
    type: "error" | "fileTransferRequest" | "FileTransferProgress" | "fileTransferSuccess" | "moveProgress" | "copyProgress"
    transferProgress?: ITransferProgress
    transferRequest?: ITransferRequest
    error?: string
    message?: string
    
} 