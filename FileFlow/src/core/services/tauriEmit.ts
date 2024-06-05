import { emit } from "@tauri-apps/api/event";
import { IFile } from "../shared/types/IFile";
import { IContextMenuData } from "../shared/types/IContextMenuData";
import { ITransferRequest } from "../shared/types/ITransferRequest";

class tauriEmit{

    emitCreateCommand(){
        emit("createNewFile");
    }
      
    emitCopyCommand() {            
        emit("copy");
    }

    emitCutCommand() {
        emit("cut");
    }

    emitPasteCommand() {
        emit("paste");
    }

    emitRenameCommand() {
        emit("rename")
    }

    emitDeleteCommand() {
        emit("delete");
    }

    emitUpdateMoveitem() {
        emit("updateMoveItem");
    }

    emitHiddenFiles(hidden: boolean) {
        emit("hiddenFiles",hidden);
    }

    emitChangeViewType(detailView:Boolean) {
        emit("changeViewType", detailView);
    }

    emitSortFiles(sortBy: string, order: string) {
        emit("sortFiles", {sortBy, order});
    }

    emitFileShare(filesAndFolders:IFile[]){
        emit("sendFile", {file: filesAndFolders})
    }

    emitUpdateFavorite(){
        emit("updateFavorites");
    }

    emitClearSelection(){
        emit("clearSelection");
    }

    emitContextMenuOpen(data: IContextMenuData){
        emit("contextMenu", data);
    
    }

    emitUpdateRecent(){
        emit("recentItemChange")
    }

    transferFileRequest(data:ITransferRequest){
        emit("transferFileRequest",data)
    }

}

export default new tauriEmit();