import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  KeyRound,
  Mail,
  MoreHorizontal,
  Pencil,
  Search,
  ShieldPlus,
  UserCog,
  UserPlus,
  UserX,
} from "lucide-react";
import { useSearchParams } from "react-router";
import {
  addAdminUser,
  getAdminRoles,
  getAdminUserActivation,
  getAdminUsers,
  sendAdminUserActivation,
  updateAdminUserPassword,
  updateAdminUserProfile,
  updateAdminUserRole,
  updateAdminUserStatus,
  type AdminRoleOption,
  type AdminUserRecord,
} from "../api/adminUsersApi";
import { useAdminAuth } from "../auth/AdminAuthContext";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Input } from "../components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";

const PAGE_SIZE = 10;

type UserScope = "active" | "staff" | "inactive" | "suspended" | "deleted";

type ToastState = {
  type: "success" | "error";
  msg: string;
} | null;

type AddUserForm = {
  displayName: string;
  email: string;
  password: string;
  roleId: number;
};

type ProfileForm = {
  displayName: string;
  username: string;
  email: string;
};

const USER_SCOPE_OPTIONS: Array<{ value: UserScope; label: string }> = [
  { value: "active", label: "已激活账号" },
  { value: "staff", label: "管理员/版主" },
  { value: "inactive", label: "未激活账号" },
  { value: "suspended", label: "已封禁账号" },
  { value: "deleted", label: "已删除账号" },
];

const STATUS_LABEL_MAP: Record<AdminUserRecord["status"], string> = {
  normal: "正常",
  inactive: "未激活",
  suspended: "已封禁",
  deleted: "已删除",
};

const STATUS_BADGE_CLASS_MAP: Record<AdminUserRecord["status"], string> = {
  normal: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:ring-emerald-900/30",
  inactive: "bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700",
  suspended: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:ring-amber-900/30",
  deleted: "bg-red-50 text-red-700 ring-red-200 dark:bg-red-900/20 dark:text-red-400 dark:ring-red-900/30",
};

function buildPageItems(currentPage: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }
  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "ellipsis", totalPages] as const;
  }
  if (currentPage >= totalPages - 3) {
    return [1, "ellipsis", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages] as const;
  }
  return [1, "ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis", totalPages] as const;
}

function formatTime(timestamp?: number) {
  if (!timestamp || timestamp <= 0) {
    return "—";
  }
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp * 1000));
}

function formatRoleName(roleName?: string) {
  const normalized = (roleName || "").toLowerCase();
  if (normalized === "admin") {
    return "管理员";
  }
  if (normalized === "moderator") {
    return "版主";
  }
  if (normalized === "user") {
    return "普通用户";
  }
  return roleName || "未设置";
}

function getAvatarFallback(user: AdminUserRecord) {
  return (user.display_name || user.username || user.e_mail || "?").trim().charAt(0).toUpperCase();
}

function getPreferredRoleId(roles: AdminRoleOption[]) {
  const adminRole = roles.find((role) => role.name.toLowerCase() === "admin");
  return adminRole?.id || roles[0]?.id || 0;
}

function UserIdentityCell({ user }: { user: AdminUserRecord }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-[13px] font-semibold text-slate-600 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700">
        {user.avatar ? (
          <img src={user.avatar} alt={user.display_name || user.username} className="h-full w-full object-cover" />
        ) : (
          getAvatarFallback(user)
        )}
      </div>
      <div className="min-w-0">
        <div className="truncate text-[14px] font-medium text-slate-900 dark:text-slate-100">
          {user.display_name || user.username}
        </div>
        <div className="truncate text-[12px] text-slate-500 dark:text-slate-400">@{user.username || "未设置用户名"}</div>
      </div>
    </div>
  );
}

function FormField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[13px] font-medium text-slate-700 dark:text-slate-300">
        {label}
        {hint ? <span className="ml-2 text-[12px] font-normal text-slate-400 dark:text-slate-500">{hint}</span> : null}
      </span>
      {children}
    </label>
  );
}

export function AdminUsers() {
  const { user: currentAdmin } = useAdminAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [count, setCount] = useState(0);
  const [roles, setRoles] = useState<AdminRoleOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingKey, setSubmittingKey] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);
  const [searchDraft, setSearchDraft] = useState(searchParams.get("query") || "");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addForm, setAddForm] = useState<AddUserForm>({
    displayName: "",
    email: "",
    password: "",
    roleId: 0,
  });
  const [editingUser, setEditingUser] = useState<AdminUserRecord | null>(null);
  const [profileForm, setProfileForm] = useState<ProfileForm>({
    displayName: "",
    username: "",
    email: "",
  });
  const [passwordUser, setPasswordUser] = useState<AdminUserRecord | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [roleUser, setRoleUser] = useState<AdminUserRecord | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState(0);

  const currentPage = Math.max(1, Number(searchParams.get("page")) || 1);
  const currentQuery = searchParams.get("query") || "";
  const currentScope = (searchParams.get("scope") as UserScope) || "active";
  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));
  const pageItems = useMemo(() => buildPageItems(currentPage, totalPages), [currentPage, totalPages]);
  const preferredRoleId = useMemo(() => getPreferredRoleId(roles), [roles]);

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    window.setTimeout(() => setToast(null), 3500);
  };

  const syncQuery = (patch: { page?: number; query?: string; scope?: UserScope }) => {
    const next = new URLSearchParams(searchParams);
    if (patch.page !== undefined) {
      next.set("page", String(patch.page));
    }
    if (patch.query !== undefined) {
      if (patch.query.trim()) {
        next.set("query", patch.query.trim());
      } else {
        next.delete("query");
      }
      next.set("page", "1");
    }
    if (patch.scope !== undefined) {
      next.set("scope", patch.scope);
      next.set("page", "1");
    }
    setSearchParams(next);
  };

  const buildScopeParams = () => {
    if (currentScope === "staff") {
      return { staff: true as const };
    }
    if (currentScope === "inactive" || currentScope === "suspended" || currentScope === "deleted") {
      return { status: currentScope };
    }
    return {};
  };

  const reloadUsers = async () => {
    setLoading(true);
    try {
      const data = await getAdminUsers({
        page: currentPage,
        pageSize: PAGE_SIZE,
        query: currentQuery || undefined,
        ...buildScopeParams(),
      });
      setUsers(data.list || []);
      setCount(data.count || 0);
      const nextTotalPages = Math.max(1, Math.ceil((data.count || 0) / PAGE_SIZE));
      if (currentPage > nextTotalPages) {
        syncQuery({ page: nextTotalPages });
      }
    } catch (error) {
      setUsers([]);
      setCount(0);
      showToast("error", error instanceof Error ? error.message : "用户列表加载失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSearchDraft(currentQuery);
  }, [currentQuery]);

  useEffect(() => {
    let cancelled = false;

    const loadRoles = async () => {
      try {
        const data = await getAdminRoles();
        if (cancelled) {
          return;
        }
        setRoles(data || []);
      } catch (error) {
        if (!cancelled) {
          showToast("error", error instanceof Error ? error.message : "角色列表加载失败");
        }
      }
    };

    void loadRoles();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (preferredRoleId && !addForm.roleId) {
      setAddForm((current) => ({
        ...current,
        roleId: preferredRoleId,
      }));
    }
  }, [addForm.roleId, preferredRoleId]);

  useEffect(() => {
    void reloadUsers();
  }, [currentPage, currentQuery, currentScope]);

  const handleOpenAddDialog = () => {
    setAddForm({
      displayName: "",
      email: "",
      password: "",
      roleId: preferredRoleId,
    });
    setAddDialogOpen(true);
  };

  const handleAddUser = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!addForm.roleId) {
      showToast("error", "请先选择账号角色");
      return;
    }

    setSubmittingKey("add-user");
    try {
      await addAdminUser({
        display_name: addForm.displayName.trim(),
        email: addForm.email.trim(),
        password: addForm.password,
      });

      let roleSynced = false;
      try {
        const lookup = await getAdminUsers({
          page: 1,
          pageSize: 10,
          query: addForm.email.trim(),
        });
        const createdUser = (lookup.list || []).find(
          (item) => item.e_mail.toLowerCase() === addForm.email.trim().toLowerCase(),
        );
        if (createdUser) {
          await updateAdminUserRole({
            user_id: createdUser.user_id,
            role_id: addForm.roleId,
          });
          roleSynced = true;
        }
      } catch {
        roleSynced = false;
      }

      setAddDialogOpen(false);
      await reloadUsers();
      showToast("success", roleSynced ? "账号已创建并设置角色" : "账号已创建，请手动确认角色是否已更新");
    } catch (error) {
      showToast("error", error instanceof Error ? error.message : "账号创建失败");
    } finally {
      setSubmittingKey(null);
    }
  };

  const openEditProfileDialog = (targetUser: AdminUserRecord) => {
    setEditingUser(targetUser);
    setProfileForm({
      displayName: targetUser.display_name || "",
      username: targetUser.username || "",
      email: targetUser.e_mail || "",
    });
  };

  const handleEditProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingUser) {
      return;
    }

    setSubmittingKey("edit-profile");
    try {
      await updateAdminUserProfile({
        user_id: editingUser.user_id,
        display_name: profileForm.displayName.trim(),
        username: profileForm.username.trim(),
        email: profileForm.email.trim(),
      });
      setEditingUser(null);
      await reloadUsers();
      showToast("success", "用户资料已更新");
    } catch (error) {
      showToast("error", error instanceof Error ? error.message : "用户资料更新失败");
    } finally {
      setSubmittingKey(null);
    }
  };

  const openPasswordDialog = (targetUser: AdminUserRecord) => {
    setPasswordUser(targetUser);
    setNewPassword("");
  };

  const handleChangePassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!passwordUser) {
      return;
    }

    setSubmittingKey("change-password");
    try {
      await updateAdminUserPassword({
        user_id: passwordUser.user_id,
        password: newPassword,
      });
      setPasswordUser(null);
      setNewPassword("");
      showToast("success", "新密码已设置");
    } catch (error) {
      showToast("error", error instanceof Error ? error.message : "密码更新失败");
    } finally {
      setSubmittingKey(null);
    }
  };

  const openRoleDialog = (targetUser: AdminUserRecord) => {
    setRoleUser(targetUser);
    setSelectedRoleId(targetUser.role_id || preferredRoleId);
  };

  const handleChangeRole = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!roleUser || !selectedRoleId) {
      return;
    }

    setSubmittingKey("change-role");
    try {
      await updateAdminUserRole({
        user_id: roleUser.user_id,
        role_id: selectedRoleId,
      });
      setRoleUser(null);
      await reloadUsers();
      showToast("success", "用户角色已更新");
    } catch (error) {
      showToast("error", error instanceof Error ? error.message : "角色更新失败");
    } finally {
      setSubmittingKey(null);
    }
  };

  const updateStatusWithConfirm = async (
    targetUser: AdminUserRecord,
    status: "normal" | "inactive" | "suspended" | "deleted",
    confirmText: string,
  ) => {
    if (!window.confirm(confirmText)) {
      return;
    }

    setSubmittingKey(`status:${targetUser.user_id}`);
    try {
      await updateAdminUserStatus({
        user_id: targetUser.user_id,
        status,
      });
      await reloadUsers();
      showToast("success", "用户状态已更新");
    } catch (error) {
      showToast("error", error instanceof Error ? error.message : "用户状态更新失败");
    } finally {
      setSubmittingKey(null);
    }
  };

  const handleCopyActivation = async (targetUser: AdminUserRecord) => {
    setSubmittingKey(`activation-link:${targetUser.user_id}`);
    try {
      const result = await getAdminUserActivation(targetUser.user_id);
      if (!navigator.clipboard?.writeText) {
        throw new Error("当前浏览器环境不支持复制");
      }
      await navigator.clipboard.writeText(result.activation_url);
      showToast("success", "激活链接已复制");
    } catch (error) {
      showToast("error", error instanceof Error ? error.message : "激活链接获取失败");
    } finally {
      setSubmittingKey(null);
    }
  };

  const handleSendActivation = async (targetUser: AdminUserRecord) => {
    setSubmittingKey(`activation-mail:${targetUser.user_id}`);
    try {
      await sendAdminUserActivation(targetUser.user_id);
      showToast("success", "激活邮件已发送");
    } catch (error) {
      showToast("error", error instanceof Error ? error.message : "激活邮件发送失败");
    } finally {
      setSubmittingKey(null);
    }
  };

  const isCurrentLoginUser = (targetUser: AdminUserRecord) => {
    return Boolean(currentAdmin?.id) && targetUser.user_id === currentAdmin?.id;
  };

  return (
    <div className="flex flex-col gap-6">
      {toast && (
        <div
          className={`flex items-center gap-3 rounded-xl px-4 py-3 text-[14px] ${
            toast.type === "success"
              ? "bg-green-50 text-green-700 ring-1 ring-green-200 dark:bg-green-900/20 dark:text-green-400 dark:ring-green-800"
              : "bg-red-50 text-red-700 ring-1 ring-red-200 dark:bg-red-900/20 dark:text-red-400 dark:ring-red-800"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          {toast.msg}
        </div>
      )}

      <section className="rounded-2xl bg-white p-5 ring-1 ring-slate-100/80 dark:bg-[#111827] dark:ring-slate-800 sm:p-6">
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 dark:border-slate-800 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-[20px] font-semibold text-slate-900 dark:text-slate-100">用户管理</h2>
            <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">
              用于新增其他管理员账号，并完成用户资料、角色、状态和密码维护。旧后台顶部筛选 tabs 不再复刻，改为搜索和范围切换。
            </p>
          </div>
          <Button type="button" onClick={handleOpenAddDialog} className="w-full sm:w-auto lg:self-start">
            <UserPlus className="h-4 w-4" />
            新增账号
          </Button>
        </div>

        <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              syncQuery({ query: searchDraft });
            }}
            className="flex flex-1 flex-col gap-3 sm:flex-row"
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={searchDraft}
                onChange={(event) => setSearchDraft(event.target.value)}
                placeholder="搜索邮箱、用户名、显示名；按用户 ID 可输入 user:123"
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" variant="outline">
                查询
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSearchDraft("");
                  syncQuery({ query: "" });
                }}
              >
                清空
              </Button>
            </div>
          </form>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <span className="text-[13px] font-medium text-slate-600 dark:text-slate-300">列表范围</span>
            <select
              value={currentScope}
              onChange={(event) => syncQuery({ scope: event.target.value as UserScope })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-[14px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#009EFF]/40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-[#33B1FF]/40 sm:w-[180px]"
            >
              {USER_SCOPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
          {loading ? (
            <div className="px-6 py-14 text-center text-[14px] text-slate-500 dark:text-slate-400">
              正在加载用户列表...
            </div>
          ) : users.length === 0 ? (
            <div className="px-6 py-14 text-center text-[14px] text-slate-500 dark:text-slate-400">
              当前范围下没有匹配的用户。
            </div>
          ) : (
            <>
              <div className="divide-y divide-slate-200 dark:divide-slate-800 md:hidden">
                {users.map((targetUser) => {
                  const selfUser = isCurrentLoginUser(targetUser);
                  return (
                    <div key={targetUser.user_id} className="bg-white px-4 py-4 dark:bg-[#111827]">
                      <div className="flex items-start justify-between gap-3">
                        <UserIdentityCell user={targetUser} />
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              type="button"
                              disabled={submittingKey?.includes(targetUser.user_id)}
                              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            {selfUser && (
                              <>
                                <div className="px-2 py-1.5 text-[12px] text-slate-400 dark:text-slate-500">当前登录账号</div>
                                <DropdownMenuSeparator />
                              </>
                            )}
                            <DropdownMenuItem onClick={() => openEditProfileDialog(targetUser)}>
                              <Pencil className="h-3.5 w-3.5" />
                              编辑资料
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openPasswordDialog(targetUser)}>
                              <KeyRound className="h-3.5 w-3.5" />
                              设置新密码
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openRoleDialog(targetUser)} disabled={selfUser || roles.length === 0}>
                              <UserCog className="h-3.5 w-3.5" />
                              修改角色
                            </DropdownMenuItem>

                            {!selfUser && targetUser.status === "inactive" && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleCopyActivation(targetUser)}>
                                  <Copy className="h-3.5 w-3.5" />
                                  复制激活链接
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleSendActivation(targetUser)}>
                                  <Mail className="h-3.5 w-3.5" />
                                  发送激活邮件
                                </DropdownMenuItem>
                              </>
                            )}

                            {!selfUser && (
                              <>
                                <DropdownMenuSeparator />
                                {targetUser.status !== "normal" && targetUser.status !== "deleted" && (
                                  <DropdownMenuItem
                                    onClick={() => updateStatusWithConfirm(targetUser, "normal", `确定将「${targetUser.display_name || targetUser.username}」恢复为正常状态吗？`)}
                                  >
                                    <ShieldPlus className="h-3.5 w-3.5" />
                                    设为正常
                                  </DropdownMenuItem>
                                )}
                                {targetUser.status === "normal" && (
                                  <>
                                    <DropdownMenuItem
                                      onClick={() => updateStatusWithConfirm(targetUser, "inactive", `确定将「${targetUser.display_name || targetUser.username}」设为未激活吗？`)}
                                    >
                                      <Mail className="h-3.5 w-3.5" />
                                      设为未激活
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => updateStatusWithConfirm(targetUser, "suspended", `确定封禁「${targetUser.display_name || targetUser.username}」吗？`)}
                                    >
                                      <UserX className="h-3.5 w-3.5" />
                                      封禁账号
                                    </DropdownMenuItem>
                                  </>
                                )}
                                {targetUser.status !== "deleted" && (
                                  <DropdownMenuItem
                                    variant="destructive"
                                    onClick={() => updateStatusWithConfirm(targetUser, "deleted", `确定删除用户「${targetUser.display_name || targetUser.username}」吗？`)}
                                  >
                                    <UserX className="h-3.5 w-3.5" />
                                    删除账号
                                  </DropdownMenuItem>
                                )}
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="mt-3 break-all text-[13px] text-slate-600 dark:text-slate-300">{targetUser.e_mail}</div>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-[12px] font-medium ring-1 ${STATUS_BADGE_CLASS_MAP[targetUser.status]}`}>
                          {STATUS_LABEL_MAP[targetUser.status]}
                        </span>
                        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[12px] font-medium text-slate-600 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700">
                          {formatRoleName(targetUser.role_name)}
                        </span>
                      </div>

                      <div className="mt-3 text-[12px] text-slate-500 dark:text-slate-400">
                        创建于 {formatTime(targetUser.created_at)}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/80 hover:bg-slate-50/80 dark:bg-slate-900/40 dark:hover:bg-slate-900/40">
                      <TableHead className="px-4">用户</TableHead>
                      <TableHead className="px-4">邮箱</TableHead>
                      <TableHead className="px-4">创建时间</TableHead>
                      <TableHead className="px-4">状态</TableHead>
                      <TableHead className="px-4">角色</TableHead>
                      <TableHead className="px-4 text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((targetUser) => {
                      const selfUser = isCurrentLoginUser(targetUser);
                      return (
                        <TableRow key={targetUser.user_id} className="bg-white dark:bg-[#111827]">
                          <TableCell className="px-4 py-3">
                            <UserIdentityCell user={targetUser} />
                          </TableCell>
                          <TableCell className="px-4 py-3 text-[13px] text-slate-600 dark:text-slate-300">
                            <div className="max-w-[240px] truncate">{targetUser.e_mail}</div>
                          </TableCell>
                          <TableCell className="px-4 py-3 text-[13px] text-slate-500 dark:text-slate-400">
                            {formatTime(targetUser.created_at)}
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            <span className={`inline-flex rounded-full px-2.5 py-1 text-[12px] font-medium ring-1 ${STATUS_BADGE_CLASS_MAP[targetUser.status]}`}>
                              {STATUS_LABEL_MAP[targetUser.status]}
                            </span>
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[12px] font-medium text-slate-600 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700">
                              {formatRoleName(targetUser.role_name)}
                            </span>
                          </TableCell>
                          <TableCell className="px-4 py-3 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button
                                  type="button"
                                  disabled={submittingKey?.includes(targetUser.user_id)}
                                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-44">
                                {selfUser && (
                                  <>
                                    <div className="px-2 py-1.5 text-[12px] text-slate-400 dark:text-slate-500">当前登录账号</div>
                                    <DropdownMenuSeparator />
                                  </>
                                )}
                                <DropdownMenuItem onClick={() => openEditProfileDialog(targetUser)}>
                                  <Pencil className="h-3.5 w-3.5" />
                                  编辑资料
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openPasswordDialog(targetUser)}>
                                  <KeyRound className="h-3.5 w-3.5" />
                                  设置新密码
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openRoleDialog(targetUser)} disabled={selfUser || roles.length === 0}>
                                  <UserCog className="h-3.5 w-3.5" />
                                  修改角色
                                </DropdownMenuItem>

                                {!selfUser && targetUser.status === "inactive" && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => handleCopyActivation(targetUser)}>
                                      <Copy className="h-3.5 w-3.5" />
                                      复制激活链接
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleSendActivation(targetUser)}>
                                      <Mail className="h-3.5 w-3.5" />
                                      发送激活邮件
                                    </DropdownMenuItem>
                                  </>
                                )}

                                {!selfUser && (
                                  <>
                                    <DropdownMenuSeparator />
                                    {targetUser.status !== "normal" && targetUser.status !== "deleted" && (
                                      <DropdownMenuItem
                                        onClick={() => updateStatusWithConfirm(targetUser, "normal", `确定将「${targetUser.display_name || targetUser.username}」恢复为正常状态吗？`)}
                                      >
                                        <ShieldPlus className="h-3.5 w-3.5" />
                                        设为正常
                                      </DropdownMenuItem>
                                    )}
                                    {targetUser.status === "normal" && (
                                      <>
                                        <DropdownMenuItem
                                          onClick={() => updateStatusWithConfirm(targetUser, "inactive", `确定将「${targetUser.display_name || targetUser.username}」设为未激活吗？`)}
                                        >
                                          <Mail className="h-3.5 w-3.5" />
                                          设为未激活
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={() => updateStatusWithConfirm(targetUser, "suspended", `确定封禁「${targetUser.display_name || targetUser.username}」吗？`)}
                                        >
                                          <UserX className="h-3.5 w-3.5" />
                                          封禁账号
                                        </DropdownMenuItem>
                                      </>
                                    )}
                                    {targetUser.status !== "deleted" && (
                                      <DropdownMenuItem
                                        variant="destructive"
                                        onClick={() => updateStatusWithConfirm(targetUser, "deleted", `确定删除用户「${targetUser.display_name || targetUser.username}」吗？`)}
                                      >
                                        <UserX className="h-3.5 w-3.5" />
                                        删除账号
                                      </DropdownMenuItem>
                                    )}
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </div>

        <div className="mt-5 flex flex-col gap-3 text-[13px] text-slate-500 dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <span>共 {count} 个用户</span>
          {totalPages > 1 ? (
            <Pagination className="justify-start sm:justify-end">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(event) => {
                      event.preventDefault();
                      if (currentPage > 1) {
                        syncQuery({ page: currentPage - 1 });
                      }
                    }}
                    className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                {pageItems.map((item, index) =>
                  item === "ellipsis" ? (
                    <PaginationItem key={`ellipsis-${index}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={item}>
                      <PaginationLink
                        href="#"
                        isActive={item === currentPage}
                        onClick={(event) => {
                          event.preventDefault();
                          syncQuery({ page: item });
                        }}
                      >
                        {item}
                      </PaginationLink>
                    </PaginationItem>
                  ),
                )}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(event) => {
                      event.preventDefault();
                      if (currentPage < totalPages) {
                        syncQuery({ page: currentPage + 1 });
                      }
                    }}
                    className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          ) : null}
        </div>
      </section>

      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>新增账号</DialogTitle>
            <DialogDescription>创建账号后会自动按你选择的角色补一次更新，用于直接新增管理员或版主账号。</DialogDescription>
          </DialogHeader>
          <form className="flex flex-col gap-4" onSubmit={handleAddUser}>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="显示名">
                <Input
                  value={addForm.displayName}
                  onChange={(event) => setAddForm((current) => ({ ...current, displayName: event.target.value }))}
                  placeholder="例如：内容运营"
                  required
                />
              </FormField>
              <FormField label="邮箱">
                <Input
                  type="email"
                  value={addForm.email}
                  onChange={(event) => setAddForm((current) => ({ ...current, email: event.target.value }))}
                  placeholder="admin@example.com"
                  required
                />
              </FormField>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="初始密码" hint="8-32 位">
                <Input
                  type="password"
                  value={addForm.password}
                  onChange={(event) => setAddForm((current) => ({ ...current, password: event.target.value }))}
                  placeholder="输入初始密码"
                  minLength={8}
                  maxLength={32}
                  required
                />
              </FormField>
              <FormField label="账号角色">
                <select
                  value={String(addForm.roleId || "")}
                  onChange={(event) =>
                    setAddForm((current) => ({
                      ...current,
                      roleId: Number(event.target.value),
                    }))
                  }
                  className="w-full rounded-md border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-[14px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#009EFF]/40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-[#33B1FF]/40"
                  required
                >
                  <option value="" disabled>
                    请选择角色
                  </option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {formatRoleName(role.name)}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddDialogOpen(false)}>
                取消
              </Button>
              <Button type="submit" disabled={submittingKey === "add-user"}>
                <UserPlus className="h-4 w-4" />
                {submittingKey === "add-user" ? "创建中..." : "创建账号"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(editingUser)} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>编辑资料</DialogTitle>
            <DialogDescription>更新显示名、用户名和邮箱。该操作会直接复用旧后台的资料更新接口。</DialogDescription>
          </DialogHeader>
          <form className="flex flex-col gap-4" onSubmit={handleEditProfile}>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="显示名">
                <Input
                  value={profileForm.displayName}
                  onChange={(event) => setProfileForm((current) => ({ ...current, displayName: event.target.value }))}
                  required
                />
              </FormField>
              <FormField label="用户名">
                <Input
                  value={profileForm.username}
                  onChange={(event) => setProfileForm((current) => ({ ...current, username: event.target.value }))}
                />
              </FormField>
            </div>
            <FormField label="邮箱">
              <Input
                type="email"
                value={profileForm.email}
                onChange={(event) => setProfileForm((current) => ({ ...current, email: event.target.value }))}
                required
              />
            </FormField>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditingUser(null)}>
                取消
              </Button>
              <Button type="submit" disabled={submittingKey === "edit-profile"}>
                <Pencil className="h-4 w-4" />
                {submittingKey === "edit-profile" ? "保存中..." : "保存资料"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(passwordUser)} onOpenChange={(open) => !open && setPasswordUser(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>设置新密码</DialogTitle>
            <DialogDescription>为目标账号直接设置一个新密码，不需要旧密码参与。</DialogDescription>
          </DialogHeader>
          <form className="flex flex-col gap-4" onSubmit={handleChangePassword}>
            <FormField label="新密码" hint="8-32 位">
              <Input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                minLength={8}
                maxLength={32}
                required
              />
            </FormField>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setPasswordUser(null)}>
                取消
              </Button>
              <Button type="submit" disabled={submittingKey === "change-password"}>
                <KeyRound className="h-4 w-4" />
                {submittingKey === "change-password" ? "更新中..." : "更新密码"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(roleUser)} onOpenChange={(open) => !open && setRoleUser(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>修改角色</DialogTitle>
            <DialogDescription>修改角色后，该账号的后台访问权限会立即按旧后台规则生效。</DialogDescription>
          </DialogHeader>
          <form className="flex flex-col gap-4" onSubmit={handleChangeRole}>
            <FormField label="角色">
              <select
                value={String(selectedRoleId || "")}
                onChange={(event) => setSelectedRoleId(Number(event.target.value))}
                className="w-full rounded-md border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-[14px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#009EFF]/40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-[#33B1FF]/40"
                required
              >
                <option value="" disabled>
                  请选择角色
                </option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {formatRoleName(role.name)}
                  </option>
                ))}
              </select>
            </FormField>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setRoleUser(null)}>
                取消
              </Button>
              <Button type="submit" disabled={submittingKey === "change-role"}>
                <UserCog className="h-4 w-4" />
                {submittingKey === "change-role" ? "更新中..." : "保存角色"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
