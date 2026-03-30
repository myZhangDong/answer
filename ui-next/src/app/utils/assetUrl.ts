export function normalizeUploadedAssetUrl(value?: string | null): string {
  const raw = value?.trim() || "";
  if (!raw) {
    return "";
  }

  if (raw.startsWith("/uploads/")) {
    return raw;
  }

  if (raw.startsWith("uploads/")) {
    return `/${raw}`;
  }

  try {
    const parsed = new URL(raw);
    if (parsed.pathname.startsWith("/uploads/")) {
      return `${parsed.pathname}${parsed.search}${parsed.hash}`;
    }
  } catch {
    // Keep non-URL values unchanged so manually pasted external URLs still work.
  }

  return raw;
}
