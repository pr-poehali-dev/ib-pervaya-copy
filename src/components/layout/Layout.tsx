import { ReactNode, useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Icon from "@/components/ui/icon";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem("sidebar-collapsed") === "true";
  });

  // На мобильных сайдбар изначально закрыт
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

  return (
    <div className="flex min-h-screen bg-background">
      {/* Overlay на мобильных */}
      {isMobile && mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Сайдбар */}
      <div className={`${isMobile ? `fixed z-40 top-0 left-0 h-full transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}` : ""}`}>
        <Sidebar
          collapsed={isMobile ? false : collapsed}
          onToggle={handleToggle}
        />
      </div>

      {/* Основной контент */}
      <main
        className={`flex-1 min-h-screen transition-all duration-300 ${
          isMobile
            ? "ml-0 p-4"
            : collapsed
            ? "ml-16 p-6 md:p-8"
            : "ml-64 p-6 md:p-8"
        }`}
      >
        {/* Кнопка открытия меню на мобильных */}
        {isMobile && (
          <button
            onClick={() => setMobileOpen(true)}
            className="mb-4 flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-card text-sm font-medium text-foreground shadow-sm"
          >
            <Icon name="Menu" size={18} />
            Меню
          </button>
        )}
        {children}
      </main>
    </div>
  );
}
