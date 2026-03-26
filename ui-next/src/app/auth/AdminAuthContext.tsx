import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  getPersistedAccessToken,
  getCurrentAdminUser,
  isAdminSessionUser,
  isAuthError,
  loginAdmin,
  persistAccessToken,
  logoutAdmin,
  type AdminLoginPayload,
  type AdminSessionUser,
} from "../api/adminAuth";

type AdminAuthContextValue = {
  user: AdminSessionUser | null;
  ready: boolean;
  loading: boolean;
  login: (payload: AdminLoginPayload) => Promise<AdminSessionUser>;
  logout: () => Promise<void>;
  loadSession: (force?: boolean) => Promise<AdminSessionUser | null>;
  isAuthenticated: boolean;
  isAdmin: boolean;
};

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminSessionUser | null>(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const inflightSessionRef = useRef<Promise<AdminSessionUser | null> | null>(null);

  const loadSession = async (force = false) => {
    if (!force && !getPersistedAccessToken()) {
      setUser(null);
      setReady(true);
      return null;
    }
    if (!force && inflightSessionRef.current) {
      return inflightSessionRef.current;
    }

    setLoading(true);
    const sessionRequest = getCurrentAdminUser()
      .then((nextUser) => {
        setUser(nextUser ?? null);
        return nextUser ?? null;
      })
      .catch((error) => {
        if (isAuthError(error)) {
          persistAccessToken();
          setUser(null);
          return null;
        }
        throw error;
      })
      .finally(() => {
        inflightSessionRef.current = null;
        setLoading(false);
        setReady(true);
      });

    inflightSessionRef.current = sessionRequest;
    return sessionRequest;
  };

  const login = async (payload: AdminLoginPayload) => {
    setLoading(true);
    try {
      const loginUser = await loginAdmin(payload);
      persistAccessToken(loginUser.access_token);
      const nextUser = await loadSession(true);
      if (!nextUser || !isAdminSessionUser(nextUser)) {
        try {
          await logoutAdmin();
        } catch {
          // Ignore logout cleanup errors after a forbidden admin login attempt.
        }
        persistAccessToken();
        setUser(null);
        setReady(true);
        throw new Error("该账号没有后台访问权限");
      }
      return nextUser;
    } finally {
      setLoading(false);
      setReady(true);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await logoutAdmin();
    } catch {
      // Clear local auth state even if the logout request fails.
    } finally {
      persistAccessToken();
      setUser(null);
      setReady(true);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!ready) {
      void loadSession();
    }
  }, [ready]);

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        ready,
        loading,
        login,
        logout,
        loadSession,
        isAuthenticated: Boolean(user?.id),
        isAdmin: isAdminSessionUser(user),
      }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }
  return context;
}
