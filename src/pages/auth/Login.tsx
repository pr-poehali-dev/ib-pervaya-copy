import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useRole } from "@/contexts/RoleContext";
import LoginFeatures from "./LoginFeatures";
import LoginForm from "./LoginForm";
import ConsentModal from "@/components/ui/ConsentModal";

const ROLE_REDIRECT: Record<string, string> = {
  superadmin:    "/super-admin",
  sales_manager: "/sales",
  admin:         "/admin",
  manager:       "/admin",
  student:       "/",
  support:       "/chat",
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

  const [pendingUser,   setPendingUser]   = useState<{ appRole: string; email: string } | null>(null);
  const [consentOpen,   setConsentOpen]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    await new Promise((r) => setTimeout(r, 300));

    const result = login(email, password);

    if (!result.ok) {
      setError(result.error ?? "Ошибка входа");
      setLoading(false);
      return;
    }

    const saved = sessionStorage.getItem("auth_user");
    if (saved) {
      const u = JSON.parse(saved);

      const alreadyAccepted = localStorage.getItem(CONSENT_KEY(u.email)) === "true";
      if (alreadyAccepted) {
        setRole(u.appRole);
        navigate(ROLE_REDIRECT[u.appRole] ?? "/");
      } else {
        setPendingUser({ appRole: u.appRole, email: u.email });
        setConsentOpen(true);
      }
    }

    setLoading(false);
  }

  function handleConsentAccept() {
    if (!pendingUser) return;
    localStorage.setItem(CONSENT_KEY(pendingUser.email), "true");
    setRole(pendingUser.appRole);
    setConsentOpen(false);
    navigate(ROLE_REDIRECT[pendingUser.appRole] ?? "/");
  }

  function handleConsentDecline() {
    setConsentOpen(false);
    setPendingUser(null);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
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
