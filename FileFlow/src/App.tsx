import FolderView from "./core/pages/folderView/FolderView";
import Sidebar from "./core/shared/components/sidebar/Sidebar";
import "./styles.scss";



function App() {
  return (
    <div className="applicationContainer">
      <Sidebar/>
      <FolderView/>
    </div>
  )
}

export default App;
