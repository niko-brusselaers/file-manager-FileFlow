import styles from "./ContainerDetailViewTop.module.scss"

function ContainerDetailViewTop() {
    return (
        <button className={`${styles.directoryItemDetail}`}>
            <div className={styles.imageContainer}>
            </div>
            <div className={styles.itemDetails}>
                <div className={styles.itemName}>
                        <p className={styles.fileName}>Name</p>
                </div>
                 <p className={styles.fileTypeText}>Type</p>
                 <p className={styles.fileTypeText} >Size</p>
                 <p className={styles.fileTypeText}>Updated</p>

            </div>
           
        </button>
    );
}

export default ContainerDetailViewTop;