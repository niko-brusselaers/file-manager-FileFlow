import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { createBrowserRouter,RouterProvider } from "react-router-dom";
import FolderView from "./core/pages/folder/FolderViewPage";
import ErrorPage from "./core/pages/error/ErrorPage";
import SearchPage from "./core/pages/search/SearchPage";

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
  <>
    <RouterProvider router={router}/>
  </>,
);
