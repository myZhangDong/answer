import React, { useEffect } from "react";
import { RouterProvider } from "react-router";
import { AdminAuthProvider } from "./auth/AdminAuthContext";
import { router } from "./routes";

const faviconImg = "/placeholder-favicon.svg";

export default function App() {
  useEffect(() => {
    // Set browser tab favicon
    const existingLink = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
    const link: HTMLLinkElement = existingLink || document.createElement("link");
    link.rel = "icon";
    link.type = "image/svg+xml";
    link.href = faviconImg;
    if (!existingLink) {
      document.head.appendChild(link);
    }
  }, []);

  return (
    <AdminAuthProvider>
      <RouterProvider router={router} />
    </AdminAuthProvider>
  );
}
