import { IFile } from "./IFile";

export interface IContextMenuData {
    selectedItems: IFile[];
    position: {x:number, y:number};
    contextType: "sidebarFavourite" | "sideBarFolder" | "sidebarRecent" | "directoryView" | "homePageFavorite" | "homePageRecent" |  "none";
}