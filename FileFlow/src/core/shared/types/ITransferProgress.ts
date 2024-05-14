export interface ITransferProgress{
     file_name: string,
    file_size: number|string,
    progress: number|string
    direction: "send" | "receive"
}