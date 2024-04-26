import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { createBrowserRouter,RouterProvider } from "react-router-dom";
import FolderView from "./core/pages/folder/FolderViewPage";
import ErrorPage from "./core/pages/error/ErrorPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        element: <FolderView />,
      },
      {
        path: "folderView",
        element: <FolderView />,
      },
    ]
  }
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router}/>
  </React.StrictMode>,
);
