import { Outlet } from "react-router-dom";
import Sidebar from "./core/shared/components/sidebar/Sidebar";
import "./styles.scss";
import NavigationMenu from "./core/shared/components/navigationMenu/NavigationMenu";



function App() {

  return (
    <>
      <NavigationMenu/>
      <div className="applicationContainer">
        <Sidebar/>
        <Outlet/>
      </div>
    </>
  )
}

export default App;
