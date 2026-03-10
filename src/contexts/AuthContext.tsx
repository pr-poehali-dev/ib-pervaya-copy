import { createContext, useContext, useState, ReactNode } from "react";
import { DEFAULT_SYSTEM_USERS } from "@/data/mockData";
import type { SystemUser } from "@/components/admin/settings/types";
import type { AppRole } from "./RoleContext";

interface AuthUser extends SystemUser {
  appRole: AppRole;
}

interface AuthContextValue {
  user: AuthUser | null;
  login: (email: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const ROLE_MAP: Record<string, AppRole> = {
  "Администратор": "admin",
  "Менеджер": "manager",
  "Преподаватель": "student",
  "Наблюдатель": "student",
  "Суперадмин": "superadmin",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = sessionStorage.getItem("auth_user");
    return saved ? JSON.parse(saved) : null;
  });

  function login(email: string, password: string): { ok: boolean; error?: string } {
    const found = DEFAULT_SYSTEM_USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.status === "active"
    );

    if (!found) {
      return { ok: false, error: "Пользователь не найден или неактивен" };
    }

    if (found.password && found.password !== password) {
      return { ok: false, error: "Неверный пароль" };
    }

    const authUser: AuthUser = {
      ...found,
      appRole: ROLE_MAP[found.role] ?? "student",
    };

    setUser(authUser);
    sessionStorage.setItem("auth_user", JSON.stringify(authUser));
    return { ok: true };
  }

  function logout() {
    setUser(null);
    sessionStorage.removeItem("auth_user");
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
