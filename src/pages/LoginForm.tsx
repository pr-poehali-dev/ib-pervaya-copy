import Icon from "@/components/ui/icon";

const TEST_ACCOUNTS = [
  { email: "admin@isp.ru",   password: "admin123",   label: "Администратор" },
  { email: "super@isp.ru",   password: "super123",   label: "Суперадмин" },
  { email: "sales@isp.ru",   password: "sales123",   label: "Менеджер продаж" },
  { email: "manager@isp.ru", password: "manager123", label: "Менеджер" },
  { email: "student@isp.ru", password: "student123", label: "Слушатель" },
  { email: "support@isp.ru", password: "support123", label: "Специалист ТП" },
];

interface LoginFormProps {
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  showPass: boolean;
  setShowPass: (v: boolean) => void;
  remember: boolean;
  setRemember: (v: boolean) => void;
  error: string;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export default function LoginForm({
  email, setEmail,
  password, setPassword,
  showPass, setShowPass,
  remember, setRemember,
  error, loading,
  onSubmit,
}: LoginFormProps) {
  return (
    <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/60 p-8 border border-gray-100">
      {/* Заголовок формы */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
          <Icon name="BookOpen" size={20} className="text-emerald-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Вход в систему</h2>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
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
            onClick={() => alert("Обратитесь к администратору системы для восстановления пароля.")}
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
  );
}