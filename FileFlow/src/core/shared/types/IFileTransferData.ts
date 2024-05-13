export interface IFileTransferData{
    file_name: string,
    file_size: number,
    file_transfer_progress: number
    file__transfer_direction: "send" | "receive"
}