import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useRole } from "@/contexts/RoleContext";
import LoginFeatures from "./LoginFeatures";
import LoginForm from "./LoginForm";

const ROLE_REDIRECT: Record<string, string> = {
  superadmin:    "/super-admin",
  sales_manager: "/sales",
  admin:         "/admin",
  manager:       "/admin",
  student:       "/",
  support:       "/chat",
};

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
      setRole(u.appRole);
      navigate(ROLE_REDIRECT[u.appRole] ?? "/");
    }

    setLoading(false);
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
    </div>
  );
}
