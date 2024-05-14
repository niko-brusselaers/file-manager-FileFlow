export interface IFileTransferData{
    file_name: string,
    file_size: number,
    progress: number
    direction: "send" | "receive"
}