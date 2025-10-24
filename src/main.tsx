import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@/components/theme-provider";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "non.geist";
import "./index.css";
import App from "./app";
import { FigmaEditorPage } from "./features/figma-editor/page";
import NewEditorPage from "./app/new-editor/page";
import AdvancedEditorPage from "./app/advanced-editor/page";
import FrameEditorPage from "./app/frame-editor/[frameId]/page";
import BoardEditorPage from "./app/board-editor/[boardId]/page";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/figma",
    element: <FigmaEditorPage />,
  },
  {
    path: "/new-editor",
    element: <NewEditorPage />,
  },
  {
    path: "/advanced-editor",
    element: <AdvancedEditorPage />,
  },
  {
    path: "/frame-editor/:frameId",
    element: <FrameEditorPage />,
  },
  {
    path: "/board-editor/:boardId",
    element: <BoardEditorPage />,
  },
]);
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <RouterProvider router={router} />
    </ThemeProvider>
  </StrictMode>,
);
