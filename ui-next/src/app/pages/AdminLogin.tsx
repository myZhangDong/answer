import { useEffect, useState } from "react";
import { AlertCircle, ArrowRight, LockKeyhole, Mail } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router";
import { useAdminAuth } from "../auth/AdminAuthContext";
import { LogoSvg } from "../components/LogoSvg";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

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

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(0,158,255,0.16),_transparent_40%),linear-gradient(180deg,_#F8FBFF_0%,_#EEF5FF_100%)] dark:bg-[radial-gradient(circle_at_top,_rgba(51,177,255,0.24),_transparent_28%),linear-gradient(180deg,_#0B1120_0%,_#111827_100%)] px-4 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md items-center">
        <section className="w-full rounded-[32px] border border-white/70 bg-white/92 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur dark:border-white/8 dark:bg-[#0F172ACC] dark:shadow-[0_24px_80px_rgba(2,6,23,0.5)] sm:p-10">
          <LogoSvg className="h-8 w-auto text-slate-900 dark:text-white" />
          <div className="mt-8">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              管理员登录
            </h1>
          </div>

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
  );
}
