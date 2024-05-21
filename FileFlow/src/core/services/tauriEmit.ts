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

}

export default new tauriEmit();