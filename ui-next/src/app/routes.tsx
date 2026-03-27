import { createBrowserRouter, Navigate } from "react-router";
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
import { AdminLogin } from "./pages/AdminLogin";
import { AdminRouteGuard } from "./routes/AdminRouteGuard";
import { AdminArticles } from "./pages/AdminArticles";
import { AdminArticleEditor } from "./pages/AdminArticleEditor";
import { AdminVideos } from "./pages/AdminVideos";
import { AdminVideoEditor } from "./pages/AdminVideoEditor";
import { AdminProjects } from "./pages/AdminProjects";
import { AdminProjectEditor } from "./pages/AdminProjectEditor";
import { AdminUsers } from "./pages/AdminUsers";
import { AdminSiteSettings } from "./pages/AdminSiteSettings";

function AdminIndexRedirect() {
  return <Navigate to="/admin/articles" replace />;
}

export const router = createBrowserRouter([
  {
    path: "/admin/login",
    Component: AdminLogin,
  },
  {
    path: "/admin",
    Component: AdminRouteGuard,
    children: [
      {
        Component: Admin,
        children: [
          {
            index: true,
            Component: AdminIndexRedirect,
          },
          {
            path: "articles",
            Component: AdminArticles,
          },
          {
            path: "articles/new",
            Component: AdminArticleEditor,
          },
          {
            path: "articles/:id/edit",
            Component: AdminArticleEditor,
          },
          {
            path: "videos",
            Component: AdminVideos,
          },
          {
            path: "videos/new",
            Component: AdminVideoEditor,
          },
          {
            path: "videos/:id/edit",
            Component: AdminVideoEditor,
          },
          {
            path: "projects",
            Component: AdminProjects,
          },
          {
            path: "users",
            Component: AdminUsers,
          },
          {
            path: "projects/new",
            Component: AdminProjectEditor,
          },
          {
            path: "projects/:id/edit",
            Component: AdminProjectEditor,
          },
          {
            path: "site-settings",
            Component: AdminSiteSettings,
          },
        ],
      },
    ],
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
