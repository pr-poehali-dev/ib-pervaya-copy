import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useRole } from "@/contexts/RoleContext";
import { DEFAULT_SYSTEM_USERS } from "@/data/mockData";
import LoginFeatures from "./LoginFeatures";
import LoginForm from "./LoginForm";
import ConsentModal from "@/components/ui/ConsentModal";
import type { AppRole } from "@/contexts/RoleContext";

const ROLE_REDIRECT: Record<string, string> = {
  superadmin:    "/super-admin",
  sales_manager: "/sales",
  admin:         "/admin",
  manager:       "/admin",
  student:       "/",
  support:       "/chat",
};

const ROLE_MAP: Record<string, AppRole> = {
  "Администратор":   "admin",
  "Менеджер":        "manager",
  "Слушатель":       "student",
  "Наблюдатель":     "student",
  "Суперадмин":      "superadmin",
  "Менеджер продаж": "sales_manager",
  "Специалист ТП":   "support",
};

const CONSENT_KEY = (email: string) => `consent_accepted_${email}`;

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { setRole } = useRole();

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const [pendingUser, setPendingUser] = useState<{ appRole: AppRole; email: string } | null>(null);
  const [consentOpen, setConsentOpen] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    await new Promise((r) => setTimeout(r, 300));

    // Проверяем учётные данные без вызова login() (чтобы не менять isAuthenticated)
    const found = DEFAULT_SYSTEM_USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.status === "active"
    );

    if (!found) {
      setError("Пользователь не найден или неактивен");
      setLoading(false);
      return;
    }

    if (found.password && found.password !== password) {
      setError("Неверный пароль");
      setLoading(false);
      return;
    }

    const appRole = ROLE_MAP[found.role] ?? "student";

    // Если согласие уже было — сразу логиним
    if (localStorage.getItem(CONSENT_KEY(found.email)) === "true") {
      login(email, password);
      setRole(appRole);
      navigate(ROLE_REDIRECT[appRole] ?? "/");
    } else {
      // Показываем модалку, login() вызовем после принятия
      setPendingUser({ appRole, email: found.email });
      setConsentOpen(true);
    }

    setLoading(false);
  }

  function handleConsentAccept() {
    if (!pendingUser) return;
    localStorage.setItem(CONSENT_KEY(pendingUser.email), "true");
    login(email, password);
    setRole(pendingUser.appRole);
    setConsentOpen(false);
    navigate(ROLE_REDIRECT[pendingUser.appRole] ?? "/");
  }

  function handleConsentDecline() {
    setConsentOpen(false);
    setPendingUser(null);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-12 items-center my-auto">
        <LoginFeatures />
        <LoginForm
          email={email}       setEmail={setEmail}
          password={password} setPassword={setPassword}
          showPass={showPass} setShowPass={setShowPass}
          remember={remember} setRemember={setRemember}
          error={error}
          loading={loading}
          onSubmit={handleSubmit}
        />
      </div>

      <ConsentModal
        open={consentOpen}
        onAccept={handleConsentAccept}
        onDecline={handleConsentDecline}
      />
    </div>
  );
}