import styles from './FolderOptionsBar.module.scss';
import { IFile } from '../../types/IFile';
import { listen } from '@tauri-apps/api/event';
import { useEffect, useState } from 'react';
import tauriEmit from '../../../services/tauriEmit';

function FolderOptionsBar({selectedItems}: {selectedItems: IFile[]}){
    const [pasteItemData, setPasteItemData] = useState<{type:string, items:IFile[]} | null>(sessionStorage.getItem("moveItem") ? JSON.parse(sessionStorage.getItem("moveItem") || '') : null);
    const [detailView, setDetailView] = useState<Boolean>(localStorage.getItem("detailView") ? JSON.parse(localStorage.getItem("detailView") || '') : false);
    const [hidden, setHidden] = useState<Boolean| null>(localStorage.getItem("hiddenFiles") ? JSON.parse(localStorage.getItem("hiddenFiles") || '') :  false);
    const [shareEnabled, setShareEnabled] = useState<Boolean>(false);
    const [sortDropDownMenyIsOpen, setSortDropDownMenuIsOpen] = useState<boolean>(false);
    const [sortBy, setSortBy] = useState<string>(localStorage.getItem("sortBy") ? localStorage.getItem("sortBy") || "" : "name");
    const [order, setOrder] = useState<string>(localStorage.getItem("order") ? localStorage.getItem("order") || "" : "ascending");

    let timeoutID: NodeJS.Timeout | null = null;


    //listen for the updateMoveItem event to update the pasteItemData state
    useEffect(() => {
        listen("updateMoveItem", () => {
            setPasteItemData(sessionStorage.getItem("moveItem") ? JSON.parse(sessionStorage.getItem("moveItem") || '') : null);
        });
    },[])

    useEffect(() => {
        if(selectedItems.length > 0 && selectedItems[0].extension !== "folder") return setShareEnabled(true)
        else return setShareEnabled(false)
        
    },[selectedItems])

    //listen for the contextMenu event to update the position state
    useEffect(() => {
        localStorage.setItem("sortBy", sortBy);
        localStorage.setItem("order", order);
        tauriEmit.emitSortFiles(sortBy, order);
    },[sortBy, order])

    //open the transfer send dialog
    function openTransferSend(){
        if(selectedItems.some(selectedItem => selectedItem.name != "")) tauriEmit.emitFileShare(selectedItems);
        else return;
    }

    //change the hidden files state
    function changeHiddenFiles(){
        localStorage.setItem("hiddenFiles", JSON.stringify(!hidden));
        setHidden(!hidden);
        tauriEmit.emitHiddenFiles(!hidden);
    }

    //change the view type
    function changeViewType(){
        tauriEmit.emitChangeViewType(!detailView);
        setDetailView(!detailView);
        localStorage.setItem("detailView", JSON.stringify(!detailView));
    }

    //handle the sort drop down menu click
    function handleSortDropDownMenuClick(){
        if(timeoutID) clearTimeout(timeoutID);
        setSortDropDownMenuIsOpen(prevState => !prevState);
    }

    //handle the mouse enter event and clear the timeout
    function handleMouseEnter(){
        if(timeoutID) clearTimeout(timeoutID);
        setSortDropDownMenuIsOpen(true);
    }


    //handle the mouse leave event and set a timeout to close the drop down menu
    function handleMouseLeave(){
        timeoutID = setTimeout(() => {
            setSortDropDownMenuIsOpen(false);
        }, 100);
    }
    

    
    return (
        <div className={styles.folderOptionsBar}>
            <div className={styles.folderOptionsBarButtonGroup}>
                <button className={styles.folderOptionsBarButton} onClick={tauriEmit.emitCreateCommand}  title='create item'>
                <img src="/create_icon.png"/>
                </button>
                <button className={`${styles.folderOptionsBarButton} ${(selectedItems.some(selectedItem => selectedItem.name != "") ? "": styles.inactive)}`} onClick={tauriEmit.emitCutCommand}  title='move item'>
                    <img src="/cut_icon.png"/>
                </button>
                <button className={`${styles.folderOptionsBarButton} ${(selectedItems.some(selectedItem => selectedItem.name != "") ? "": styles.inactive)}`} onClick={tauriEmit.emitCopyCommand} title='copy item'>
                    <img src="/copy_icon.png"/>
                </button>
                <button className={`${styles.folderOptionsBarButton} ${(pasteItemData ? "": styles.inactive)}`} onClick={tauriEmit.emitPasteCommand}  title='paste item'>
                    <img src="/paste_icon.png"/>
                </button>
                <button className={`${styles.folderOptionsBarButton} ${(selectedItems.some(selectedItem => selectedItem.name != "") ? "": styles.inactive)}`} onClick={tauriEmit.emitDeleteCommand} title='delete item'>
                    <img src="/delete_icon.png"/>
                </button>
                <button className={`${styles.folderOptionsBarButton} ${(selectedItems.some(selectedItem => selectedItem.name != "") ? "": styles.inactive)}`} onClick={tauriEmit.emitRenameCommand}  title='rename item'>
                    <img src="/rename_icon.png"/>
                </button>
            </div>
            <div className={styles.folderOptionsBarButtonGroup}>
                <div className={styles.sortDropDownMenu} onMouseLeave={handleMouseLeave}>
                    <button className={styles.folderOptionsBarButton}  onClick={handleSortDropDownMenuClick}  title='sort items'>
                        <img src="/sort_icon.png" />
                    </button>
                    <form className={styles.dropDownContainer} style={sortDropDownMenyIsOpen ? {display:"flex"} : {display:"none"} } onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                        <div className={styles.radioContainer}>
                            <h4>Sort By</h4>
                            <div className={styles.radioInput}>
                                <label htmlFor="name">Name</label>
                                <input type="radio" name="sortBy" id="name" defaultChecked={sortBy === "name"} value={"name"} onChange={(event) => setSortBy(event.target.value)}/>
                            </div>
                            <div  className={styles.radioInput}>
                                <label htmlFor="size">Size</label>
                                <input type="radio" name="sortBy" id="size" defaultChecked={sortBy === "size"} value={"size"}  onChange={(event) => setSortBy(event.target.value)}/>
                            </div>
                            <div  className={styles.radioInput}>
                                <label htmlFor="type">Type</label>
                                <input type="radio" name="sortBy" id="type" defaultChecked={sortBy === "type"} value={"type"}  onChange={(event) => setSortBy(event.target.value)}/>
                            </div>
                             <div  className={styles.radioInput}>
                                <label htmlFor="updated">Updated</label>
                                <input type="radio" name="sortBy" id="updated" defaultChecked={sortBy === "updated"} value={"updated"}  onChange={(event) => setSortBy(event.target.value)}/>
                            </div>

                        </div>
                        <div className={styles.radioContainer}>
                            <h4 >Order</h4>
                            <div className={styles.radioInput}>
                                <label htmlFor="ascending">Ascending</label>
                                <input type="radio" name="order" id="ascending" defaultChecked={order === "ascending"} value={"ascending"}  onChange={(event) => setOrder(event.target.value)}/>
                            </div>
                            <div className={styles.radioInput}>
                                <label htmlFor="descending">Descending</label>
                                <input type="radio" name="order" id="descending" defaultChecked={order === "descending"} value={"descending"}  onChange={(event) => setOrder(event.target.value)}/>
                            </div>
                        </div>
                    </form>
                 </div>
                
                <button className={styles.folderOptionsBarButton} onClick={changeHiddenFiles} title={(hidden ? "show hidden items" : "hide Hidden items")}>
                    <img src="/showHidden_icon.png" />
                </button>
                <button className={styles.folderOptionsBarButton} onClick={changeViewType} title="change view type">
                    <img src="/folderView_icon.png" />
                </button>
            </div>
            <div className={styles.folderOptionsBarButtonGroup}>
                <button className={`${styles.folderOptionsBarButton} ${shareEnabled ? " " : styles.inactive}`} onClick={() => {openTransferSend()}}>
                    <img src="/share_icon.png" alt="share item" title='share item'/>
                </button>
                {/* <button className={styles.folderOptionsBarButton}>
                    <img src="/zipFunction_icon.png" alt="zip" />
                </button>
                <button className={styles.folderOptionsBarButton}>
                    <img src="/unzip_icon.png" alt="unzip" />
                </button> */}

            </div>
               
        </div>
    );
}

export default FolderOptionsBar;