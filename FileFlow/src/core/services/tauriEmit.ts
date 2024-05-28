import { emit } from "@tauri-apps/api/event";
import { IFile } from "../shared/types/IFile";

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

}

export default new tauriEmit();