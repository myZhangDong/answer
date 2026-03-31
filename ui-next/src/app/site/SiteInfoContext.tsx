import { createContext, useContext, useEffect, useState } from "react";
import { getPublicSiteInfo, type PublicSiteInfoSettings } from "../api/siteSettingsApi";

const DEFAULT_SITE_INFO: PublicSiteInfoSettings = {
  general: {
    name: "",
    short_description: "",
    description: "",
    site_url: "",
    contact_email: "",
    check_update: true,
  },
  branding: {
    logo: "",
    mobile_logo: "",
    square_icon: "",
    favicon: "",
  },
  homepage: {
    home_banner: {
      enabled: false,
      image_url: "",
      link_url: "",
    },
    hot_articles_ad: {
      enabled: false,
      image_url: "",
      link_url: "",
    },
  },
  siteSeo: {
    permalink: 4,
    robots: "",
  },
};

interface SiteInfoContextValue {
  siteInfo: PublicSiteInfoSettings;
  loading: boolean;
  error: string;
  refreshSiteInfo: () => Promise<void>;
}

const SiteInfoContext = createContext<SiteInfoContextValue | null>(null);

export function SiteInfoProvider({ children }: { children: React.ReactNode }) {
  const [siteInfo, setSiteInfo] = useState<PublicSiteInfoSettings>(DEFAULT_SITE_INFO);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refreshSiteInfo = async () => {
    setLoading(true);
    try {
      const data = await getPublicSiteInfo();
      setSiteInfo(data);
      setError("");
    } catch (refreshError) {
      setError(refreshError instanceof Error ? refreshError.message : "站点配置加载失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const data = await getPublicSiteInfo();
        if (cancelled) {
          return;
        }
        setSiteInfo(data);
        setError("");
      } catch (loadError) {
        if (cancelled) {
          return;
        }
        setError(loadError instanceof Error ? loadError.message : "站点配置加载失败");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <SiteInfoContext.Provider
      value={{
        siteInfo,
        loading,
        error,
        refreshSiteInfo,
      }}
    >
      {children}
    </SiteInfoContext.Provider>
  );
}

export function useSiteInfo() {
  const context = useContext(SiteInfoContext);
  if (!context) {
    throw new Error("useSiteInfo must be used within a SiteInfoProvider");
  }
  return context;
}
