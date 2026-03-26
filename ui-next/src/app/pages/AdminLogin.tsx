import { useEffect, useState } from "react";
import { AlertCircle, ArrowRight, LockKeyhole, Mail } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { LogoSvg } from "../components/LogoSvg";
import { useAdminAuth } from "../auth/AdminAuthContext";

export function AdminLogin() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, ready, loading, isAdmin, user, loadSession } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!ready && !loading) {
      void loadSession();
    }
  }, [ready, loading, loadSession]);

  useEffect(() => {
    if (ready && isAdmin) {
      navigate(searchParams.get("redirect") || "/admin", { replace: true });
    }
  }, [ready, isAdmin, navigate, searchParams]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email || !password) {
      setError("请输入管理员邮箱和密码");
      return;
    }

    setError("");
    try {
      await login({
        e_mail: email,
        pass: password,
      });
      navigate(searchParams.get("redirect") || "/admin", { replace: true });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "登录失败，请稍后重试");
    }
  };

  const currentAccount = user?.display_name || user?.username || user?.e_mail;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(0,158,255,0.16),_transparent_40%),linear-gradient(180deg,_#F8FBFF_0%,_#EEF5FF_100%)] dark:bg-[radial-gradient(circle_at_top,_rgba(51,177,255,0.24),_transparent_28%),linear-gradient(180deg,_#0B1120_0%,_#111827_100%)] px-4 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl items-center">
        <div className="grid w-full gap-8 md:grid-cols-[1.2fr_0.9fr]">
          <section className="hidden rounded-[32px] border border-white/50 bg-white/65 p-10 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/8 dark:bg-[#0F172AB3] dark:shadow-[0_24px_80px_rgba(2,6,23,0.45)] md:flex md:flex-col md:justify-between">
            <div>
              <LogoSvg className="h-8 w-auto text-slate-900 dark:text-white" />
              <div className="mt-10 space-y-4">
                <div className="inline-flex rounded-full border border-[#009EFF]/15 bg-[#009EFF]/8 px-4 py-2 text-sm font-medium text-[#0078C9] dark:border-[#33B1FF]/20 dark:bg-[#33B1FF]/10 dark:text-[#7DD3FF]">
                  ui-next 管理后台
                </div>
                <h1 className="max-w-lg text-4xl font-semibold leading-tight tracking-tight text-slate-900 dark:text-slate-100">
                  复用现有后台会话进入新的内容管理界面
                </h1>
                <p className="max-w-xl text-sm leading-7 text-slate-600 dark:text-slate-300">
                  当前版本只接管理员邮箱密码登录，并继续复用现有后端会话、角色判定和退出登录链路，不另起一套认证模型。
                </p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-4 dark:border-white/8 dark:bg-white/5">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">复用现有登录接口</p>
                <p className="mt-2 text-xs leading-6 text-slate-500 dark:text-slate-400">
                  `/answer/api/v1/user/login/email`、`/user/info`、`/user/logout`
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-4 dark:border-white/8 dark:bg-white/5">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">管理员准入规则</p>
                <p className="mt-2 text-xs leading-6 text-slate-500 dark:text-slate-400">
                  继续沿用旧后台语义，仅允许 `role_id === 2`
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-[32px] border border-white/70 bg-white/92 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur dark:border-white/8 dark:bg-[#0F172ACC] dark:shadow-[0_24px_80px_rgba(2,6,23,0.5)] sm:p-10">
            <LogoSvg className="h-8 w-auto text-slate-900 dark:text-white md:hidden" />
            <div className="mt-8 md:mt-0">
              <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                管理员登录
              </div>
              <h2 className="mt-5 text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                登录 `ui-next` 后台
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
                当前阶段只开放管理员邮箱密码登录。验证码、User Center 和 Connector 兼容项后续单独补齐。
              </p>
            </div>

            {currentAccount ? (
              <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-200">
                当前会话账号为 <span className="font-medium">{currentAccount}</span>。如需切换管理员，请直接重新登录。
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">管理员邮箱</span>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="admin@example.com"
                    autoComplete="email"
                    className="h-12 rounded-xl border-slate-200 bg-white pl-11 dark:border-slate-700 dark:bg-slate-900"
                  />
                </div>
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">密码</span>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="请输入管理员密码"
                    autoComplete="current-password"
                    className="h-12 rounded-xl border-slate-200 bg-white pl-11 dark:border-slate-700 dark:bg-slate-900"
                  />
                </div>
              </label>

              {error ? (
                <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              ) : null}

              <Button
                type="submit"
                disabled={loading}
                className="h-12 w-full rounded-xl bg-[#009EFF] text-white hover:bg-[#0089E0] dark:bg-[#33B1FF] dark:hover:bg-[#1FA8FF]">
                {loading ? "登录中..." : "进入后台"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
