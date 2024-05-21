import { Menu, MenuItem } from "@tauri-apps/api/menu";
import tauriEmit from "../../../services/tauriEmit";


class ContextMenu{

    async emptyContextMenu(){
        const menu = await Menu.new()
    
        await menu.popup()
    };

    async getFolderViewContextMenu(){

        const menu = await Menu.new({items:[
            await MenuItem.new({text:"Copy",enabled:true,accelerator:"CTRL+C",action: tauriEmit.emitCopyCommand}),
            await MenuItem.new({text:"Cut",enabled:true,accelerator:"CTRL+X",action: tauriEmit.emitCutCommand}),
            await MenuItem.new({text:"Paste",enabled:true,accelerator:"CTRL+V",action: tauriEmit.emitPasteCommand}),
            await MenuItem.new({text:"Rename",enabled:true,accelerator:"F2",action: tauriEmit.emitRenameCommand}),
            await MenuItem.new({text:"Delete",enabled:true,accelerator:"DELETE",action: tauriEmit.emitDeleteCommand}),
            await MenuItem.new({text:"Refresh",enabled:true,accelerator:"CTRL+R",action: () => { window.location.reload();}}),
        ]});
    
        return menu;

    

    };


   
}

export default new ContextMenu();