import { IFile } from "./IFile";

export interface IContextMenuData {
    selectedItems: IFile[];
    position: {x:number, y:number};
    contextType: "sidebarFavourite" | "sideBarFolder" | "directoryView" | "homePageFavorite" | "homePageRecent" |  "none";
}