import { ApiError, LOGGED_TOKEN_STORAGE_KEY, apiRequest } from "./client";

export interface AdminLoginPayload {
  e_mail: string;
  pass: string;
  captcha_id?: string;
  captcha_code?: string;
}

export interface AdminSessionUser {
  id?: string;
  username?: string;
  display_name?: string;
  e_mail?: string;
  avatar?: string;
  access_token?: string;
  role_id?: number;
  mail_status?: number;
  [key: string]: unknown;
}

const ADMIN_ROLE_ID = 2;
const INACTIVE_MAIL_STATUS = 2;

export function isAdminSessionUser(user: AdminSessionUser | null | undefined) {
  return Boolean(user?.id) && user?.role_id === ADMIN_ROLE_ID && user?.mail_status !== INACTIVE_MAIL_STATUS;
}

export async function loginAdmin(payload: AdminLoginPayload) {
  return apiRequest<AdminSessionUser>("/answer/api/v1/user/login/email", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getCurrentAdminUser() {
  return apiRequest<AdminSessionUser>("/answer/api/v1/user/info");
}

export async function logoutAdmin() {
  return apiRequest<boolean>("/answer/api/v1/user/logout");
}

export function isAuthError(error: unknown) {
  return error instanceof ApiError && (error.status === 401 || error.status === 403);
}

export function persistAccessToken(token?: string) {
  if (typeof window === "undefined") {
    return;
  }
  if (token) {
    window.localStorage.setItem(LOGGED_TOKEN_STORAGE_KEY, token);
  } else {
    window.localStorage.removeItem(LOGGED_TOKEN_STORAGE_KEY);
  }
}

export function getPersistedAccessToken() {
  if (typeof window === "undefined") {
    return "";
  }
  return window.localStorage.getItem(LOGGED_TOKEN_STORAGE_KEY) || "";
}
