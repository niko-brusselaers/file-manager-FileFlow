import { useState } from "react";
import styles from "./ContainerDetailViewTop.module.scss"
import tauriEmit from "../../../services/tauriEmit";

function ContainerDetailViewTop() {
    const [sortingConfig, setSortingConfig] = useState<{sortBy:string, order:string}>(localStorage.getItem("sortBy") && localStorage.getItem("order") ? {sortBy:localStorage.getItem("sortBy") || "", order:localStorage.getItem("order") || ""} : {sortBy:"name", order:"ascending"});


// //listen for the contextMenu event to update the position state
//     useEffect(() => {
//         localStorage.setItem("sortBy", sortBy);
//         localStorage.setItem("order", order);
//         tauriEmit.emitSortFiles(sortBy, order);
//     },[sortBy, order])

    function updateSortingConfig(sortBy: string) {
        const validSortByValues = ["updated", "name", "size", "type"];

        if( !validSortByValues.includes(sortBy)) return console.error(`Invalid sortBy value: ${sortBy}. Must be one of: ${validSortByValues.join(", ")}`);
        let newSortingconfig = {sortBy: sortBy, order: "ascending"};
        if (sortingConfig.sortBy === sortBy) newSortingconfig.order = "descending";
        setSortingConfig(newSortingconfig);
        tauriEmit.emitSortFiles(sortBy, newSortingconfig.order);
    }


    return (
        <button className={`${styles.ItemDetailTopView}`}>
            <div className={styles.imageContainer}>
            </div>
            <div className={styles.itemDetails}>
                <div className={styles.itemName}>
                        <button className={styles.fileName} onClick={() => updateSortingConfig("name")}>Name</button>
                </div>
                 <button className={styles.fileTypeText} onClick={() => updateSortingConfig("type")}>Updated</button>
                 <button className={styles.fileTypeText} onClick={() => updateSortingConfig("size")}>Type</button>
                 <button className={styles.fileTypeText} onClick={() => updateSortingConfig("updated")}>Size</button>

            </div>
           
        </button>
    );
}

export default ContainerDetailViewTop;