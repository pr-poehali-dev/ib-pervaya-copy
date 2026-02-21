import { NavLink, useLocation } from "react-router-dom";
import Icon from "@/components/ui/icon";

const navItems = [
  { to: "/", icon: "LayoutDashboard", label: "Главная" },
  { to: "/courses", icon: "BookOpen", label: "Курсы" },
  { to: "/my-learning", icon: "GraduationCap", label: "Моё обучение" },
  { to: "/schedule", icon: "Calendar", label: "Расписание" },
  { to: "/achievements", icon: "Trophy", label: "Достижения" },
  { to: "/profile", icon: "User", label: "Профиль" },
  { to: "/admin", icon: "ShieldCheck", label: "Администратор" },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="sidebar-gradient w-64 min-h-screen flex flex-col fixed left-0 top-0 z-40">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 gradient-primary rounded-xl flex items-center justify-center">
            <Icon name="Zap" size={18} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-lg leading-tight font-['Manrope']">EduFlow</p>
            <p className="text-white/40 text-xs">Платформа обучения</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? "gradient-primary text-white shadow-lg shadow-purple-500/25"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              }`}
            >
              <Icon
                name={item.icon}
                size={20}
                className={isActive ? "text-white" : "text-white/60 group-hover:text-white"}
              />
              <span className="font-medium text-sm">{item.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full" />
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 cursor-pointer transition-all">
          <div className="w-9 h-9 gradient-secondary rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-sm">АИ</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">Алина Иванова</p>
            <p className="text-white/40 text-xs">Студент</p>
          </div>
          <Icon name="ChevronRight" size={16} className="text-white/40" />
        </div>
      </div>
    </aside>
  );
}