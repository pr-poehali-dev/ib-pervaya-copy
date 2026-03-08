import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { useTheme } from "@/contexts/ThemeContext";
import { useStats } from "@/contexts/StatsContext";
import { useRole } from "@/contexts/RoleContext";
import ThemePicker from "@/components/ui/ThemePicker";
import RoleSwitcher from "@/components/ui/RoleSwitcher";

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
  const { theme } = useTheme();
  const { stats } = useStats();
  const { role } = useRole();
  const [themePickerOpen, setThemePickerOpen] = useState(false);

  const navItems: NavItem[] =
    role === "superadmin"    ? SUPERADMIN_NAV :
    role === "sales_manager" ? SALES_NAV :
    role === "admin"         ? ADMIN_NAV :
    role === "manager"       ? MANAGER_NAV :
    STUDENT_NAV;

  const statItems = [
    { icon: "Users",       value: stats.users,       label: "Слушателей", color: "from-violet-500 to-purple-700" },
    { icon: "BookOpen",    value: stats.courses,      label: "Курсов",     color: "from-cyan-500 to-blue-600" },
    { icon: "CheckCircle", value: stats.assignments,  label: "Назначений", color: "from-emerald-500 to-teal-600" },
    { icon: "Trophy",      value: stats.completed,    label: "Завершено",  color: "from-amber-500 to-orange-600" },
  ];

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
              <Icon name="Zap" size={18} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-tight font-['Manrope']">ИСП</p>
              <p className="text-white/40 text-xs">Платформа обучения</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-9 h-9 gradient-primary rounded-xl flex items-center justify-center">
            <Icon name="Zap" size={18} className="text-white" />
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

      {/* Выбор темы */}
      <ThemePicker
        collapsed={collapsed}
        open={themePickerOpen}
        onToggle={() => setThemePickerOpen((p) => !p)}
      />

      {/* Переключатель роли */}
      <div className="border-t border-white/10 p-2">
        <RoleSwitcher collapsed={collapsed} />
      </div>

      {/* Пользователь */}
      <div className="p-2 border-t border-white/10">
        <div className={`flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/10 cursor-pointer transition-all ${collapsed ? "justify-center" : ""}`}>
          <div className="w-9 h-9 gradient-secondary rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">АИ</span>
          </div>
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">Алина Иванова</p>
                <p className="text-white/40 text-xs">{ROLE_LABELS[role] ?? "Слушатель"}</p>
              </div>
              <Icon name="ChevronRight" size={16} className="text-white/40" />
            </>
          )}
        </div>
      </div>
    </aside>
  );
}