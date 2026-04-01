const UTM_HELPER_SCRIPT_ID = "easemob-community-utm-helper";
const UTM_HELPER_SCRIPT_URL = "https://doc.easemob.com/utm_helper.js";

let utmHelperPromise: Promise<void> | null = null;

export function ensureUtmHelperScript() {
  if (typeof document === "undefined") {
    return Promise.resolve();
  }

  if (utmHelperPromise) {
    return utmHelperPromise;
  }

  utmHelperPromise = new Promise((resolve) => {
    const existing = document.getElementById(UTM_HELPER_SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      if (existing.dataset.loaded === "true") {
        resolve();
        return;
      }
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => resolve(), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = UTM_HELPER_SCRIPT_ID;
    script.async = true;
    script.src = UTM_HELPER_SCRIPT_URL;
    script.addEventListener("load", () => {
      script.dataset.loaded = "true";
      resolve();
    }, { once: true });
    script.addEventListener("error", () => resolve(), { once: true });
    document.head.appendChild(script);
  });

  return utmHelperPromise;
}
