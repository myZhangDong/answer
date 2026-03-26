interface LegacyApiResponse<T> {
  code: number;
  reason?: string;
  msg?: string;
  data: T;
}

export const LOGGED_TOKEN_STORAGE_KEY = "_a_ltk_";

export class ApiError extends Error {
  status: number;
  payload?: LegacyApiResponse<unknown> | null;

  constructor(status: number, message: string, payload?: LegacyApiResponse<unknown> | null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(
  /\/$/,
  "",
);
const ACCEPT_LANGUAGE = import.meta.env.VITE_ACCEPT_LANGUAGE || "zh-CN";

function buildUrl(path: string) {
  if (!API_BASE_URL) {
    return path;
  }
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  return `${API_BASE_URL}${path}`;
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers || {});
  const accessToken =
    typeof window !== "undefined"
      ? window.localStorage.getItem(LOGGED_TOKEN_STORAGE_KEY) || ""
      : "";
  headers.set("Accept-Language", ACCEPT_LANGUAGE);
  if (accessToken && !headers.has("Authorization")) {
    headers.set("Authorization", accessToken);
  }

  if (!(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(buildUrl(path), {
    credentials: "include",
    ...init,
    headers,
  });

  if (response.status === 204) {
    return true as T;
  }

  let body: LegacyApiResponse<T> | null = null;
  try {
    body = (await response.json()) as LegacyApiResponse<T>;
  } catch (error) {
    if (!response.ok) {
      throw new ApiError(response.status, `Request failed with status ${response.status}`);
    }
    throw error;
  }

  if (!response.ok) {
    throw new ApiError(response.status, body?.msg || `Request failed with status ${response.status}`, body);
  }

  return body.data;
}
