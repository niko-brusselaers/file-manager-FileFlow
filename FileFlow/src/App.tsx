import { Outlet } from "react-router-dom";
import FolderView from "./core/pages/folderView/FolderView";
import Sidebar from "./core/shared/components/sidebar/Sidebar";
import "./styles.scss";



function App() {
  return (
    <div className="applicationContainer">
      <Sidebar/>
      <Outlet/>
    </div>
  )
}

export default App;
