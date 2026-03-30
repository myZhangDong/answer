import { apiRequest } from "./client";
import { normalizeUploadedAssetUrl } from "../utils/assetUrl";

export interface AdminLanguageOption {
  label: string;
  value: string;
}

export interface SiteGeneralSettings {
  name: string;
  short_description: string;
  description: string;
  site_url: string;
  contact_email: string;
  check_update: boolean;
}

export interface SiteInterfaceSettings {
  language: string;
  time_zone: string;
}

export interface SiteBrandingSettings {
  logo: string;
  mobile_logo: string;
  square_icon: string;
  favicon: string;
}

export interface SiteSeoSettings {
  permalink: number;
  robots: string;
}

export interface SiteHomepageBannerSettings {
  enabled: boolean;
  image_url: string;
  link_url: string;
}

export interface SiteHomepageSettings {
  home_banner: SiteHomepageBannerSettings;
  hot_articles_ad: SiteHomepageBannerSettings;
}

const EMPTY_BANNER: SiteHomepageBannerSettings = {
  enabled: false,
  image_url: "",
  link_url: "",
};

function normalizeHomepageSettings(data?: Partial<SiteHomepageSettings> | null): SiteHomepageSettings {
  return {
    home_banner: {
      ...EMPTY_BANNER,
      ...(data?.home_banner || {}),
      image_url: normalizeUploadedAssetUrl(data?.home_banner?.image_url),
    },
    hot_articles_ad: {
      ...EMPTY_BANNER,
      ...(data?.hot_articles_ad || {}),
      image_url: normalizeUploadedAssetUrl(data?.hot_articles_ad?.image_url),
    },
  };
}

function normalizeBrandingSettings(data?: Partial<SiteBrandingSettings> | null): SiteBrandingSettings {
  return {
    logo: normalizeUploadedAssetUrl(data?.logo),
    mobile_logo: normalizeUploadedAssetUrl(data?.mobile_logo),
    square_icon: normalizeUploadedAssetUrl(data?.square_icon),
    favicon: normalizeUploadedAssetUrl(data?.favicon),
  };
}

export async function getAdminLanguageOptions() {
  return apiRequest<AdminLanguageOption[]>("/answer/admin/api/language/options", {
    method: "GET",
  });
}

export async function getSiteGeneralSettings() {
  return apiRequest<SiteGeneralSettings>("/answer/admin/api/siteinfo/general", {
    method: "GET",
  });
}

export async function updateSiteGeneralSettings(payload: SiteGeneralSettings) {
  return apiRequest<SiteGeneralSettings>("/answer/admin/api/siteinfo/general", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function getSiteInterfaceSettings() {
  return apiRequest<SiteInterfaceSettings>("/answer/admin/api/siteinfo/interface", {
    method: "GET",
  });
}

export async function updateSiteInterfaceSettings(payload: SiteInterfaceSettings) {
  return apiRequest<void>("/answer/admin/api/siteinfo/interface", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function getSiteBrandingSettings() {
  const data = await apiRequest<SiteBrandingSettings>("/answer/admin/api/siteinfo/branding", {
    method: "GET",
  });
  return normalizeBrandingSettings(data);
}

export async function updateSiteBrandingSettings(payload: SiteBrandingSettings) {
  return apiRequest<void>("/answer/admin/api/siteinfo/branding", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function getSiteSeoSettings() {
  return apiRequest<SiteSeoSettings>("/answer/admin/api/siteinfo/seo", {
    method: "GET",
  });
}

export async function updateSiteSeoSettings(payload: SiteSeoSettings) {
  return apiRequest<void>("/answer/admin/api/siteinfo/seo", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function getAdminHomepageSettings() {
  const data = await apiRequest<SiteHomepageSettings>("/answer/admin/api/siteinfo/homepage", {
    method: "GET",
  });
  return normalizeHomepageSettings(data);
}

export async function updateAdminHomepageSettings(payload: SiteHomepageSettings) {
  return apiRequest<void>("/answer/admin/api/siteinfo/homepage", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function getPublicHomepageSettings() {
  const data = await apiRequest<SiteHomepageSettings>("/answer/api/v1/siteinfo/homepage", {
    method: "GET",
  });
  return normalizeHomepageSettings(data);
}
