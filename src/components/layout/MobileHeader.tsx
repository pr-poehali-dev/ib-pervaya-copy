import { NavLink, useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { useRole } from "@/contexts/RoleContext";
import { useAuth } from "@/contexts/AuthContext";
import { useBranding } from "@/contexts/BrandingContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import ThemePicker from "@/components/ui/ThemePicker";
import AccessibilityPanel from "@/components/ui/AccessibilityPanel";
import { CHAT_THREADS, getUnreadCount } from "@/data/chatMockData";
import { useState } from "react";

type NavItem = { to: string; icon: string; label: string };

const STUDENT_NAV: NavItem[] = [
  { to: "/",            icon: "LayoutDashboard", label: "Главная" },
  { to: "/my-learning", icon: "GraduationCap",   label: "Моё обучение" },
  { to: "/achievements",icon: "Trophy",           label: "Достижения" },
  { to: "/chat",        icon: "MessageCircle",    label: "Поддержка" },
  { to: "/profile",     icon: "User",             label: "Профиль" },
];

const ADMIN_NAV: NavItem[] = [
  { to: "/admin",   icon: "ShieldCheck",   label: "Панель управления" },
  { to: "/catalog", icon: "BookOpen",      label: "Каталог курсов" },
  { to: "/chat",    icon: "MessageCircle", label: "Поддержка" },
  { to: "/profile", icon: "User",          label: "Профиль" },
];

const MANAGER_NAV: NavItem[] = [
  { to: "/admin",   icon: "ShieldCheck",   label: "Панель управления" },
  { to: "/catalog", icon: "BookOpen",      label: "Каталог курсов" },
  { to: "/chat",    icon: "MessageCircle", label: "Поддержка" },
  { to: "/profile", icon: "User",          label: "Профиль" },
];

const SUPERADMIN_NAV: NavItem[] = [
  { to: "/super-admin", icon: "Crown",         label: "Суперадмин" },
  { to: "/chat",        icon: "MessageCircle", label: "Все обращения" },
  { to: "/profile",     icon: "User",          label: "Профиль" },
];

const SALES_NAV: NavItem[] = [
  { to: "/sales",   icon: "Briefcase",     label: "Менеджер продаж" },
  { to: "/chat",    icon: "MessageCircle", label: "Обращения" },
  { to: "/profile", icon: "User",          label: "Профиль" },
];

const SUPPORT_NAV: NavItem[] = [
  { to: "/chat",    icon: "HeadphonesIcon", label: "Техподдержка" },
  { to: "/profile", icon: "User",           label: "Профиль" },
];

const ROLE_LABELS: Record<string, string> = {
  superadmin:    "Суперадминистратор",
  sales_manager: "Менеджер продаж",
  admin:         "Администратор",
  manager:       "Менеджер",
  student:       "Слушатель",
  support:       "Специалист ТП",
};

interface MobileHeaderProps {
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export default function MobileHeader({ open, onToggle, onClose }: MobileHeaderProps) {
  const { role } = useRole();
  const { user, logout } = useAuth();
  const { branding } = useBranding();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [themePickerOpen, setThemePickerOpen] = useState(false);
  const [a11yOpen, setA11yOpen] = useState(false);
  const { isModified: a11yModified } = useAccessibility();

  const chatUnread = getUnreadCount(CHAT_THREADS, user?.email ?? "");

  const navItems: NavItem[] =
    role === "superadmin"    ? SUPERADMIN_NAV :
    role === "sales_manager" ? SALES_NAV :
    role === "admin"         ? ADMIN_NAV :
    role === "manager"       ? MANAGER_NAV :
    role === "support"       ? SUPPORT_NAV :
    STUDENT_NAV;

  const initials = user
    ? `${user.lastName[0] ?? ""}${user.firstName[0] ?? ""}`
    : "??";
  const fullName = user
    ? `${user.lastName} ${user.firstName[0]}.${user.middleName ? user.middleName[0] + "." : ""}`
    : "Гость";

  function handleLogout() {
    logout();
    onClose();
    navigate("/login");
  }

  return (
    <>
      {/* Хедер */}
      <header className="fixed top-0 left-0 right-0 z-50 sidebar-gradient border-b border-white/10 flex items-center justify-between px-4 h-14">
        {/* Логотип */}
        <div className="flex items-center gap-3">
          {branding.logoUrl ? (
            <img src={branding.logoUrl} alt="Логотип" className="h-8 max-w-[120px] object-contain" />
          ) : (
            <>
              <div className="w-8 h-8 gradient-primary rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon name="BookOpen" size={16} className="text-white" />
              </div>
              <div>
                <p className="text-white font-bold text-sm leading-tight font-['Manrope']">ИСП</p>
                <p className="text-white/40 text-[9px]">Система подготовки</p>
              </div>
            </>
          )}
        </div>

        {/* Гамбургер */}
        <button
          onClick={onToggle}
          className="text-white/70 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-all"
        >
          <Icon name={open ? "X" : "Menu"} size={22} />
        </button>
      </header>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={onClose}
        />
      )}

      {/* Выпадающее меню */}
      <div
        className={`fixed top-14 left-0 right-0 z-50 sidebar-gradient border-b border-white/10 transition-all duration-300 overflow-hidden ${
          open ? "max-h-[calc(100vh-3.5rem)] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const isChat = item.to === "/chat";
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? "gradient-primary text-white shadow-lg shadow-purple-500/25"
                      : "text-white/60 hover:text-white hover:bg-white/10"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="relative flex-shrink-0">
                      <Icon
                        name={item.icon}
                        size={20}
                        className={isActive ? "text-white" : "text-white/60"}
                      />
                      {isChat && chatUnread > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white font-bold flex items-center justify-center">
                          {chatUnread > 9 ? "9+" : chatUnread}
                        </span>
                      )}
                    </div>
                    <span className="font-medium text-sm">{item.label}</span>
                    {isChat && chatUnread > 0 && (
                      <span className="ml-auto min-w-[20px] h-5 bg-red-500 rounded-full text-[10px] text-white font-bold flex items-center justify-center px-1">
                        {chatUnread > 99 ? "99+" : chatUnread}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Разделитель */}
        <div className="mx-4 border-t border-white/10" />

        {/* Тема + Пользователь */}
        <div className="p-3 space-y-1">
          <button
            onClick={() => setThemePickerOpen(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all"
          >
            <Icon name="Sun" size={20} className="text-white/60" />
            <span className="font-medium text-sm">Тема оформления</span>
            <Icon name="ChevronRight" size={16} className="ml-auto text-white/40" />
          </button>
          <button
            onClick={() => { setA11yOpen(true); onClose(); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all relative"
          >
            <Icon name="Accessibility" size={20} className="text-white/60" />
            <span className="font-medium text-sm">Для слабовидящих</span>
            {a11yModified && <span className="w-2 h-2 bg-primary rounded-full ml-1" />}
            <Icon name="ChevronRight" size={16} className="ml-auto text-white/40" />
          </button>

          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5">
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold truncate">{fullName}</p>
              <p className="text-white/40 text-[11px]">{ROLE_LABELS[role ?? ""] ?? role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-white/40 hover:text-red-400 transition-colors p-1"
              title="Выйти"
            >
              <Icon name="LogOut" size={18} />
            </button>
          </div>
        </div>
      </div>

      {themePickerOpen && (
        <ThemePicker onClose={() => setThemePickerOpen(false)} />
      )}
      <AccessibilityPanel open={a11yOpen} onClose={() => setA11yOpen(false)} />
    </>
  );
}