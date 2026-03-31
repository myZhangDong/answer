export const EASEMOB_CONSOLE_REGISTER_URL =
  "https://console.easemob.com/user/register?from=community";

export type ConsoleRegisterSource =
  | "header_desktop"
  | "header_mobile"
  | "article_detail_bottom"
  | "video_detail_bottom"
  | "project_detail_bottom";

export type ConsoleRegisterContentType = "article" | "video" | "project";

interface ConsoleRegisterClickPayload {
  source: ConsoleRegisterSource;
  contentType?: ConsoleRegisterContentType;
  contentId?: string;
  contentTitle?: string;
}

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackConsoleRegisterClick(payload: ConsoleRegisterClickPayload) {
  if (typeof window === "undefined") {
    return;
  }

  const eventPayload: Record<string, unknown> = {
    event: "community_console_register_click",
    destination_url: EASEMOB_CONSOLE_REGISTER_URL,
    page_path: window.location.pathname,
    page_search: window.location.search,
    timestamp: Date.now(),
    ...payload,
  };

  window.dataLayer?.push(eventPayload);

  if (typeof window.gtag === "function") {
    window.gtag("event", "community_console_register_click", {
      destination_url: EASEMOB_CONSOLE_REGISTER_URL,
      page_path: window.location.pathname,
      page_search: window.location.search,
      ...payload,
    });
  }

  window.dispatchEvent(
    new CustomEvent("community_console_register_click", {
      detail: eventPayload,
    }),
  );
}
