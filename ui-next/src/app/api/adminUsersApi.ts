import { apiRequest } from "./client";

export interface AdminUserRecord {
  user_id: string;
  created_at: number;
  deleted_at: number;
  suspended_at: number;
  username: string;
  e_mail: string;
  rank: number;
  status: "normal" | "inactive" | "suspended" | "deleted";
  display_name: string;
  avatar: string;
  role_id: number;
  role_name: string;
}

export interface AdminUserListResult {
  count: number;
  list: AdminUserRecord[];
}

export interface AdminRoleOption {
  id: number;
  name: string;
  description: string;
}

export interface AdminUserListParams {
  page?: number;
  pageSize?: number;
  query?: string;
  staff?: boolean;
  status?: "inactive" | "suspended" | "deleted";
}

export interface AddAdminUserPayload {
  display_name: string;
  email: string;
  password: string;
}

export interface UpdateAdminUserProfilePayload {
  user_id: string;
  display_name: string;
  username: string;
  email: string;
}

export interface UpdateAdminUserRolePayload {
  user_id: string;
  role_id: number;
}

export interface UpdateAdminUserStatusPayload {
  user_id: string;
  status: "normal" | "inactive" | "suspended" | "deleted";
  remove_all_content?: boolean;
}

export interface UpdateAdminUserPasswordPayload {
  user_id: string;
  password: string;
}

function toQuery(params: Record<string, string | number | boolean | undefined>) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });
  return query.toString();
}

export async function getAdminUsers(params: AdminUserListParams = {}) {
  const query = toQuery({
    page: params.page || 1,
    page_size: params.pageSize || 10,
    query: params.query,
    staff: params.staff,
    status: params.status,
  });
  return apiRequest<AdminUserListResult>(`/answer/admin/api/users/page?${query}`);
}

export async function getAdminRoles() {
  return apiRequest<AdminRoleOption[]>("/answer/admin/api/roles");
}

export async function addAdminUser(payload: AddAdminUserPayload) {
  return apiRequest<void>("/answer/admin/api/user", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateAdminUserProfile(payload: UpdateAdminUserProfilePayload) {
  return apiRequest<void>("/answer/admin/api/user/profile", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function updateAdminUserRole(payload: UpdateAdminUserRolePayload) {
  return apiRequest<void>("/answer/admin/api/user/role", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function updateAdminUserStatus(payload: UpdateAdminUserStatusPayload) {
  return apiRequest<void>("/answer/admin/api/user/status", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function updateAdminUserPassword(payload: UpdateAdminUserPasswordPayload) {
  return apiRequest<void>("/answer/admin/api/user/password", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function getAdminUserActivation(userId: string) {
  return apiRequest<{ activation_url: string }>(
    `/answer/admin/api/user/activation?${toQuery({ user_id: userId })}`,
  );
}

export async function sendAdminUserActivation(user_id: string) {
  return apiRequest<void>("/answer/admin/api/user/activation", {
    method: "POST",
    body: JSON.stringify({ user_id }),
  });
}
