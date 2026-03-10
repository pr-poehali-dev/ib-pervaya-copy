import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useRole } from "@/contexts/RoleContext";
import Icon from "@/components/ui/icon";

const FEATURES = [
  {
    icon: "BrainCircuit",
    title: "AI ассистент тренинга",
    desc: "Для формирования траектории подготовки",
  },
  {
    icon: "GraduationCap",
    title: "Обучение и тренинг персонала",
    desc: "Подготовка к аттестации и проверке знаний",
  },
  {
    icon: "BarChart2",
    title: "Аналитика и отчёты",
    desc: "Статистика, отчеты и аналитика в одном ЛК",
  },
  {
    icon: "Plug",
    title: "Интеграция",
    desc: "Индекс безопасности — система управления промышленной безопасностью",
  },
];

const TEST_ACCOUNTS = [
  { email: "admin@isp.ru",   password: "admin123",   label: "Администратор" },
  { email: "super@isp.ru",   password: "super123",   label: "Суперадмин" },
  { email: "manager@isp.ru", password: "manager123", label: "Менеджер" },
  { email: "student@isp.ru", password: "student123", label: "Преподаватель" },
];

const ROLE_REDIRECT: Record<string, string> = {
  superadmin: "/super-admin",
  sales_manager: "/sales",
  admin: "/admin",
  manager: "/admin",
  student: "/",
};

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { setRole } = useRole();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

        {/* Левая часть */}
        <div className="space-y-8">
          {/* Логотип */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-200">
              <Icon name="BookOpen" size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Интеллектуальная система подготовки</h1>
              <p className="text-sm text-gray-500">Система дистанционного обучения персонала</p>
            </div>
          </div>

          {/* Фичи */}
          <div className="space-y-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="flex items-start gap-4 bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/80 shadow-sm"
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
                  <Icon name={f.icon} size={20} className="text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{f.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Правая часть — форма */}
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/60 p-8 border border-gray-100">
          {/* Заголовок формы */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
              <Icon name="BookOpen" size={20} className="text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Вход в систему</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Логин или email
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@isp.ru"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all placeholder:text-gray-400"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <Icon name="Key" size={16} className="text-gray-400" />
                  <div className="w-6 h-6 rounded-md bg-emerald-500 flex items-center justify-center">
                    <Icon name="ShieldCheck" size={12} className="text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Пароль */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Пароль
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center hover:bg-emerald-600 transition-colors"
                >
                  <Icon name={showPass ? "EyeOff" : "Eye"} size={14} className="text-white" />
                </button>
              </div>
            </div>

            {/* Ошибка */}
            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2">
                <Icon name="AlertCircle" size={15} />
                {error}
              </div>
            )}

            {/* Запомнить + Забыли пароль */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-emerald-500 accent-emerald-500"
                />
                <span className="text-sm text-gray-600">Запомнить меня</span>
              </label>
              <button
                type="button"
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
              >
                Забыли пароль?
              </button>
            </div>

            {/* Кнопка входа */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl transition-all shadow-md shadow-emerald-200 hover:shadow-emerald-300 text-sm"
            >
              {loading ? (
                <Icon name="Loader2" size={18} className="animate-spin" />
              ) : (
                <Icon name="LogIn" size={18} />
              )}
              Войти
            </button>

            {/* Тестовые аккаунты */}
            <div className="pt-2">
              <p className="text-xs text-gray-400 text-center mb-2">Быстрый вход для тестирования</p>
              <div className="grid grid-cols-2 gap-1.5">
                {TEST_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => { setEmail(acc.email); setPassword(acc.password); }}
                    className="text-left px-3 py-2 rounded-lg border border-gray-100 bg-gray-50 hover:bg-emerald-50 hover:border-emerald-200 transition-all group"
                  >
                    <p className="text-xs font-medium text-gray-700 group-hover:text-emerald-700">{acc.label}</p>
                    <p className="text-[10px] text-gray-400 truncate">{acc.email}</p>
                  </button>
                ))}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}