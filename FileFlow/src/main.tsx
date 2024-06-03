import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { createBrowserRouter,RouterProvider } from "react-router-dom";
import FolderView from "./core/pages/folder/FolderViewPage";
import ErrorPage from "./core/pages/error/ErrorPage";
import SearchPage from "./core/pages/search/SearchPage";
import HomePage from "./core/pages/home/HomePage";
import SettingsPage from "./core/pages/settings/SettingsPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "",
        element: <HomePage/>,
      },
      {
        path:"settings",
        element:<SettingsPage/>
      },
      {
        path: ":folderName",
        element: <FolderView />,
      },
      {
        path: "search/:searchQuery",
        element: <SearchPage/>,
      }
    ]
  }
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router}/>
  </React.StrictMode>,
);
