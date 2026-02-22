import { NavLink, useLocation } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { useTheme } from "@/contexts/ThemeContext";

const navItems = [
  { to: "/", icon: "LayoutDashboard", label: "Главная" },
  { to: "/courses", icon: "BookOpen", label: "Курсы" },
  { to: "/my-learning", icon: "GraduationCap", label: "Моё обучение" },
  { to: "/schedule", icon: "Calendar", label: "Расписание" },
  { to: "/achievements", icon: "Trophy", label: "Достижения" },
  { to: "/profile", icon: "User", label: "Профиль" },
  { to: "/admin", icon: "ShieldCheck", label: "Администратор" },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

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
              <p className="text-white font-bold text-lg leading-tight font-['Manrope']">EduFlow</p>
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

      {/* Переключатель темы */}
      <div className="px-2 pb-1">
        <button
          onClick={toggleTheme}
          title={theme === "dark" ? "Светлая тема" : "Тёмная тема"}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all ${collapsed ? "justify-center" : ""}`}
        >
          <Icon name={theme === "dark" ? "Sun" : "Moon"} size={18} className="flex-shrink-0" />
          {!collapsed && (
            <span className="text-sm font-medium">
              {theme === "dark" ? "Светлая тема" : "Тёмная тема"}
            </span>
          )}
        </button>
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
                <p className="text-white/40 text-xs">Студент</p>
              </div>
              <Icon name="ChevronRight" size={16} className="text-white/40" />
            </>
          )}
        </div>
      </div>
    </aside>
  );
}