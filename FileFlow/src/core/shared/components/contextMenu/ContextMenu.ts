import { Menu, MenuItem } from "@tauri-apps/api/menu";


class ContextMenu{

    async emptyContextMenu(){
        const menu = await Menu.new()
    
        await menu.popup()
    };

    async folderViewContextMenu(){
        const menu = await Menu.new({items:[
            await MenuItem.new({text:"new",enabled:true}),
            await MenuItem.new({text:"Paste",enabled:true}),
            await MenuItem.new({text:"Refresh",enabled:true}),
        ]});
    
        await menu.popup()  
};
}

export default new ContextMenu();