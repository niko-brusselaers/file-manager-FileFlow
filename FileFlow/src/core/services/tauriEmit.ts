import { emit } from "@tauri-apps/api/event";

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

}

export default new tauriEmit();