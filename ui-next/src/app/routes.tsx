import { createBrowserRouter } from "react-router";
import { MainLayout } from "./components/MainLayout";
import { Home } from "./pages/Home";
import { ArticleDetail } from "./pages/ArticleDetail";
import { VideoTutorials } from "./pages/VideoTutorials";
import { VideoDetail } from "./pages/VideoDetail";
import { OpenSource } from "./pages/OpenSource";
import { OpenSourceDetail } from "./pages/OpenSourceDetail";
import { Search } from "./pages/Search";
import { NotFound } from "./pages/NotFound";
import { Admin } from "./pages/Admin";

export const router = createBrowserRouter([
  {
    path: "/admin",
    Component: Admin,
  },
  {
    path: "/",
    Component: MainLayout,
    children: [
      { index: true, Component: Home },
      { path: "article/:id", Component: ArticleDetail },
      { path: "videos", Component: VideoTutorials },
      { path: "video/:id", Component: VideoDetail },
      { path: "projects", Component: OpenSource },
      { path: "project/:id", Component: OpenSourceDetail },
      { path: "search", Component: Search },
      { path: "*", Component: NotFound },
    ],
  },
]);