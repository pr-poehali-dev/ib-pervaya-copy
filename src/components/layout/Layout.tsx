import { ReactNode, useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Icon from "@/components/ui/icon";
import { useRole } from "@/contexts/RoleContext";
import { useAuth } from "@/contexts/AuthContext";
import { CHAT_THREADS, getUnreadCount } from "@/data/chatMockData";

interface LayoutProps {
  children: ReactNode;
}

const STUDENT_BOTTOM = [
  { to: "/",             icon: "LayoutDashboard", label: "Главная" },
  { to: "/my-learning",  icon: "GraduationCap",   label: "Обучение" },
  { to: "/achievements", icon: "Trophy",           label: "Успехи" },
  { to: "/chat",         icon: "MessageCircle",    label: "Чат" },
  { to: "/profile",      icon: "User",             label: "Профиль" },
];

const ADMIN_BOTTOM = [
  { to: "/admin",   icon: "ShieldCheck",   label: "Управление" },
  { to: "/catalog", icon: "BookOpen",      label: "Каталог" },
  { to: "/chat",    icon: "MessageCircle", label: "Чат" },
  { to: "/profile", icon: "User",          label: "Профиль" },
];

export default function Layout({ children }: LayoutProps) {
  const { role } = useRole();
  const { user } = useAuth();

  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem("sidebar-collapsed") === "true";
  });

  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  useEffect(() => {
    const handler = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setMobileOpen(false);
    };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const handleToggle = () => {
    if (isMobile) {
      setMobileOpen((v) => !v);
    } else {
      setCollapsed((v) => {
        localStorage.setItem("sidebar-collapsed", String(!v));
        return !v;
      });
    }
  };

  const chatUnread = getUnreadCount(CHAT_THREADS, user?.email ?? "");

  const bottomNav =
    role === "admin" || role === "manager" ? ADMIN_BOTTOM :
    role === "student" ? STUDENT_BOTTOM :
    null;

  return (
    <div className="flex min-h-screen bg-background">
      {/* Overlay на мобильных */}
      {isMobile && mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Сайдбар (только десктоп) */}
      {!isMobile && (
        <Sidebar
          collapsed={collapsed}
          onToggle={handleToggle}
        />
      )}

      {/* Сайдбар (мобильный drawer) */}
      {isMobile && (
        <div className={`fixed z-40 top-0 left-0 h-full transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <Sidebar
            collapsed={false}
            onToggle={() => setMobileOpen(false)}
          />
        </div>
      )}

      {/* Основной контент */}
      <main
        className={`flex-1 min-h-screen transition-all duration-300 ${
          isMobile
            ? "ml-0 p-4 pb-24"
            : collapsed
            ? "ml-16 p-6 md:p-8"
            : "ml-64 p-6 md:p-8"
        }`}
      >
        {children}
      </main>

      {/* Нижняя навигация на мобильном */}
      {isMobile && bottomNav && (
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border flex items-stretch safe-bottom">
          {bottomNav.map((item) => {
            const isChat = item.icon === "MessageCircle";
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-[10px] font-medium transition-colors relative ${
                    isActive
                      ? "text-violet-600 dark:text-violet-400"
                      : "text-muted-foreground"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="relative">
                      <Icon name={item.icon} size={22} className={isActive ? "text-violet-600 dark:text-violet-400" : "text-muted-foreground"} />
                      {isChat && chatUnread > 0 && (
                        <span className="absolute -top-1 -right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                          {chatUnread > 9 ? "9+" : chatUnread}
                        </span>
                      )}
                    </div>
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      )}
    </div>
  );
}
