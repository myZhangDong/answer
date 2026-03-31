import React, { useEffect } from "react";
import { RouterProvider } from "react-router";
import { AdminAuthProvider } from "./auth/AdminAuthContext";
import { router } from "./routes";
import { SiteInfoProvider, useSiteInfo } from "./site/SiteInfoContext";

const DEFAULT_APP_TITLE = "开发者内容门户";
const DEFAULT_APP_DESCRIPTION = "开发者内容门户";
const DEFAULT_FAVICON = "/placeholder-favicon.svg";

function SiteRuntimeEffects() {
  const { siteInfo } = useSiteInfo();

  const title = siteInfo.general.name || DEFAULT_APP_TITLE;
  const description = siteInfo.general.short_description || siteInfo.general.description || DEFAULT_APP_DESCRIPTION;
  const favicon = siteInfo.branding.favicon || siteInfo.branding.square_icon || DEFAULT_FAVICON;

  useEffect(() => {
    const existingLink = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
    const link: HTMLLinkElement = existingLink || document.createElement("link");
    link.rel = "icon";
    link.href = favicon;
    if (!existingLink) {
      document.head.appendChild(link);
    }
  }, [favicon]);

  useEffect(() => {
    document.title = title;

    let descriptionMeta = document.querySelector("meta[name='description']") as HTMLMetaElement | null;
    if (!descriptionMeta) {
      descriptionMeta = document.createElement("meta");
      descriptionMeta.name = "description";
      document.head.appendChild(descriptionMeta);
    }
    descriptionMeta.content = description;
  }, [description, title]);

  return null;
}

export default function App() {
  return (
    <SiteInfoProvider>
      <SiteRuntimeEffects />
      <AdminAuthProvider>
        <RouterProvider router={router} />
      </AdminAuthProvider>
    </SiteInfoProvider>
  );
}
