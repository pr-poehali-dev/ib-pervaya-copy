import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { useTheme } from "@/contexts/ThemeContext";
import { useStats } from "@/contexts/StatsContext";
import { useRole } from "@/contexts/RoleContext";
import { useAuth } from "@/contexts/AuthContext";
import ThemePicker from "@/components/ui/ThemePicker";

type NavItem = { to: string; icon: string; label: string };

const STUDENT_NAV: NavItem[] = [
  { to: "/",            icon: "LayoutDashboard", label: "Главная" },
  { to: "/my-learning", icon: "GraduationCap",   label: "Моё обучение" },
  { to: "/schedule",    icon: "Calendar",         label: "Расписание" },
  { to: "/achievements",icon: "Trophy",           label: "Достижения" },
  { to: "/profile",     icon: "User",             label: "Профиль" },
];

const ADMIN_NAV: NavItem[] = [
  { to: "/admin",   icon: "ShieldCheck", label: "Панель управления" },
  { to: "/catalog", icon: "BookOpen",    label: "Каталог курсов" },
  { to: "/profile", icon: "User",        label: "Профиль" },
];

const MANAGER_NAV: NavItem[] = [
  { to: "/admin",   icon: "ShieldCheck", label: "Панель управления" },
  { to: "/catalog", icon: "BookOpen",    label: "Каталог курсов" },
  { to: "/profile", icon: "User",        label: "Профиль" },
];

const SUPERADMIN_NAV: NavItem[] = [
  { to: "/super-admin", icon: "Crown",    label: "Суперадмин" },
  { to: "/profile",     icon: "User",     label: "Профиль" },
];

const SALES_NAV: NavItem[] = [
  { to: "/sales",   icon: "Briefcase", label: "Менеджер продаж" },
  { to: "/profile", icon: "User",      label: "Профиль" },
];

const ROLE_LABELS: Record<string, string> = {
  superadmin:    "Суперадминистратор",
  sales_manager: "Менеджер продаж",
  admin:         "Администратор",
  manager:       "Менеджер",
  student:       "Слушатель",
};

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { stats } = useStats();
  const { role } = useRole();
  const { user, logout } = useAuth();
  const [themePickerOpen, setThemePickerOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const initials = user
    ? `${user.lastName[0] ?? ""}${user.firstName[0] ?? ""}`
    : "??";
  const fullName = user
    ? `${user.lastName} ${user.firstName[0]}.${user.middleName ? user.middleName[0] + "." : ""}`
    : "Гость";

  const navItems: NavItem[] =
    role === "superadmin"    ? SUPERADMIN_NAV :
    role === "sales_manager" ? SALES_NAV :
    role === "admin"         ? ADMIN_NAV :
    role === "manager"       ? MANAGER_NAV :
    STUDENT_NAV;

  const statItems = [
    { icon: "Ticket",        value: stats.subscriptionsLeft, label: "подписок осталось", color: "from-violet-500 to-purple-700" },
    { icon: "CreditCard",    value: stats.subscriptionsUsed, label: "списано в месяце",  color: "from-cyan-500 to-blue-600" },
    { icon: "GraduationCap", value: stats.inProgress,        label: "на подготовке",     color: "from-emerald-500 to-teal-600" },
    { icon: "Clock",         value: stats.pending,           label: "ожидают активации", color: "from-amber-500 to-orange-600" },
  ];

  const totalSubs = stats.subscriptionsLeft + stats.subscriptionsUsed;
  const usedPct = totalSubs > 0 ? Math.round((stats.subscriptionsUsed / totalSubs) * 100) : 0;
  const leftPct = 100 - usedPct;

  const showStats = role === "admin" || role === "manager";

  return (
    <aside
      className={`sidebar-gradient min-h-screen flex flex-col fixed left-0 top-0 z-40 transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Логотип + кнопка сворачивания */}
      <div className={`border-b border-white/10 flex items-center ${collapsed ? "justify-center p-3" : "justify-between p-4 pl-6"}`}>
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 gradient-primary rounded-xl flex items-center justify-center flex-shrink-0">
              <Icon name="BookOpen" size={18} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight font-['Manrope']">ИСП</p>
              <p className="text-white/40 text-[10px]">Система подготовки</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-9 h-9 gradient-primary rounded-xl flex items-center justify-center">
            <Icon name="BookOpen" size={18} className="text-white" />
          </div>
        )}
        <button
          onClick={onToggle}
          className={`text-white/50 hover:text-white hover:bg-white/10 rounded-lg p-1.5 transition-all ${collapsed ? "mt-2 absolute top-3 right-1" : ""}`}
          title={collapsed ? "Развернуть" : "Свернуть"}
        >
          <Icon name={collapsed ? "ChevronsRight" : "ChevronsLeft"} size={16} />
        </button>
      </div>

      {/* Навигация */}
      <nav className="flex-1 p-2 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
                collapsed ? "justify-center" : ""
              } ${
                isActive
                  ? "gradient-primary text-white shadow-lg shadow-purple-500/25"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              }`}
            >
              <Icon
                name={item.icon}
                size={20}
                className={isActive ? "text-white flex-shrink-0" : "text-white/60 group-hover:text-white flex-shrink-0"}
              />
              {!collapsed && (
                <span className="font-medium text-sm">{item.label}</span>
              )}
              {!collapsed && isActive && (
                <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Статистика (только для admin/manager) */}
      {showStats && !collapsed && (
        <div className="px-3 pb-2">
          <div className="grid grid-cols-2 gap-1.5">
            {statItems.map((s) => (
              <div key={s.label} className="bg-white/5 rounded-xl px-2.5 py-2 flex items-center gap-2">
                <div className={`w-6 h-6 bg-gradient-to-br ${s.color} rounded-md flex items-center justify-center flex-shrink-0`}>
                  <Icon name={s.icon} size={12} className="text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-white font-bold text-sm leading-none">{s.value}</p>
                  <p className="text-white/40 text-[10px] leading-tight truncate">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {showStats && collapsed && (
        <div className="px-2 pb-2 space-y-1">
          {statItems.map((s) => (
            <div key={s.label} title={`${s.label}: ${s.value}`} className="bg-white/5 rounded-xl p-1.5 flex flex-col items-center">
              <div className={`w-6 h-6 bg-gradient-to-br ${s.color} rounded-md flex items-center justify-center`}>
                <Icon name={s.icon} size={11} className="text-white" />
              </div>
              <p className="text-white font-bold text-[10px] mt-0.5">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Прогресс-бар подписок */}
      {showStats && !collapsed && (
        <div className="px-3 pb-2">
          <div className="bg-white/5 rounded-xl px-3 py-2.5 space-y-1.5">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-white/50">Подписки использованы</span>
              <span className="text-white/70 font-semibold">{stats.subscriptionsUsed} / {totalSubs}</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all"
                style={{ width: `${leftPct}%` }}
              />
            </div>
            <p className="text-[10px] text-white/40">{stats.subscriptionsLeft} осталось доступных</p>
          </div>
        </div>
      )}

      {/* Выбор темы */}
      <ThemePicker
        collapsed={collapsed}
        open={themePickerOpen}
        onToggle={() => setThemePickerOpen((p) => !p)}
      />

      {/* Пользователь + выход */}
      <div className="p-2 border-t border-white/10 space-y-1">
        <div className={`flex items-center gap-3 px-3 py-3 rounded-xl ${collapsed ? "justify-center" : ""}`}>
          <div className="w-9 h-9 gradient-secondary rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">{initials}</span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{fullName}</p>
              <p className="text-white/40 text-xs">{ROLE_LABELS[role] ?? "Слушатель"}</p>
            </div>
          )}
        </div>
        <button
          onClick={handleLogout}
          title="Выйти из системы"
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-all ${collapsed ? "justify-center" : ""}`}
        >
          <Icon name="LogOut" size={18} className="flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Выйти</span>}
        </button>
      </div>
    </aside>
  );
}