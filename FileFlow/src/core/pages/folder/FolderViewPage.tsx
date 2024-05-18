import { useEffect, useState } from "react";
import { IFile } from "../../shared/types/IFile";
import DirectoryItem from "../../shared/components/directoryItem/DirectoryItem";
import styles from './FolderView.module.scss';
import FolderOptionsBar from "../../shared/components/folderOptionsBar/FolderOptionsBar";
import { useLocation, useNavigate } from "react-router-dom";
import fileManagement from "../../services/fileManagement";

function FolderView() {
  // const folderTypes = ["folder", "drive", "Bin"];
  const [filesAndFolders, setFilesAndFolders] = useState<IFile[]>([]);
  const loaderData: IFile = useLocation().state;
  const navigate = useNavigate();
  const [selectedItem, setSelectedItem] = useState<IFile>({
    file_name: "",
    file_path: "",
    file_type: "",
    file_size: "",
    edit: false,
  });

  

  function getFilesAndFolders(directoryPath: string){
    fileManagement.getDirectoryItems(directoryPath).then((data) => {
      if (!data?.filesAndFolders && !data?.directoryPath) return;
      setFilesAndFolders(data.filesAndFolders);
      setSelectedItem({
        file_name: "",
        file_path: "",
        file_type: "",
        file_size: "",
        edit: false,
      });
    }).catch((error) => {
      console.error("Error fetching files and folders:", error);
    });    
  };

  const handleClick = (item: IFile) => {
    if (selectedItem === item) {
      if (item.file_type === "folder" || item.file_type === "drive") {
        navigate(`/${item.file_name}`, { state: item });
      } else {
        fileManagement.openFile(item.file_path);
      }
    } else {
      setSelectedItem(item);
    }
  };

  async function createNewFile(){
    const newFile: IFile = {
      file_name: "newFile",
      file_path: loaderData.file_path,
      file_type: "",
      file_size: "",
      edit: true,
    };
    setFilesAndFolders((prevFilesAndFolders) => [newFile, ...prevFilesAndFolders]);
    setSelectedItem(newFile);
  };

  function deleteFileOrFolder(selectedItem: IFile){
    if (!selectedItem.file_name) return;
    fileManagement.deleteItem(selectedItem.file_path)
  }; 

  function renameFileOrFolder(selectedItem: IFile){
    if (!selectedItem.file_name) return;
    const updatedFilesAndFolders = filesAndFolders.map((fileOrFolder) => {
      if (fileOrFolder.file_name === selectedItem.file_name) fileOrFolder.edit = true;
      return fileOrFolder;});
    setFilesAndFolders(updatedFilesAndFolders);
  }

  useEffect(() => {
    if (loaderData === null || loaderData.file_name === "My Device") {
      fileManagement.getdrives().then((data) => {
        if (!data?.filesAndFolders && !data?.directoryPath) return;
        setFilesAndFolders(data.filesAndFolders);
      }).catch((error) => {
        console.error("Error fetching drives:", error);
      });
    } else {
      getFilesAndFolders(loaderData.file_path);
    }
  }, [loaderData]);

  return (
    <div className={styles.directoryView}>
      <FolderOptionsBar selectedItem={selectedItem} currentPath={loaderData ? loaderData.file_path : ""} deleteItem={deleteFileOrFolder} createItem={createNewFile} editItem={renameFileOrFolder} />

      <h2 className={styles.directoryName}>
        {loaderData ? loaderData.file_name : "My device"}
      </h2>

      <div className={styles.directoryContainer}>
        {filesAndFolders.map((fileOrFolder, index) => (
          <DirectoryItem
            item={fileOrFolder}
            edit={fileOrFolder.edit}
            handleClick={handleClick}
            selectedItem={selectedItem}
            key={index}
          />
        ))}
      </div>
    </div>
  );
}

export default FolderView;
