import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { useRole, AppRole, TenantType } from "@/contexts/RoleContext";

const ROLES: { key: AppRole; label: string; icon: string; path: string }[] = [
  { key: "superadmin",    label: "Суперадминистратор", icon: "Crown",       path: "/super-admin" },
  { key: "sales_manager", label: "Менеджер продаж",    icon: "Briefcase",   path: "/sales" },
  { key: "admin",         label: "Администратор",      icon: "ShieldCheck", path: "/admin" },
  { key: "manager",       label: "Менеджер",           icon: "UserCog",     path: "/admin" },
  { key: "student",       label: "Слушатель",          icon: "GraduationCap", path: "/" },
];

const ROLE_COLORS: Record<AppRole, string> = {
  superadmin:    "from-violet-500 to-purple-700",
  sales_manager: "from-amber-500 to-orange-600",
  admin:         "from-cyan-500 to-blue-600",
  manager:       "from-emerald-500 to-teal-600",
  student:       "from-rose-400 to-pink-600",
};

export default function RoleSwitcher({ collapsed }: { collapsed: boolean }) {
  const { role, setRole, tenantType, setTenantType, canOwnCourses, setCanOwnCourses } = useRole();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const current = ROLES.find((r) => r.key === role)!;

  const handleSelect = (r: typeof ROLES[0]) => {
    setRole(r.key);
    setOpen(false);
    navigate(r.path);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        title={collapsed ? `Роль: ${current.label}` : undefined}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 transition-all ${collapsed ? "justify-center" : ""}`}
      >
        <div className={`w-7 h-7 bg-gradient-to-br ${ROLE_COLORS[role]} rounded-lg flex items-center justify-center flex-shrink-0`}>
          <Icon name={current.icon} size={14} className="text-white" />
        </div>
        {!collapsed && (
          <>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-white/40 text-[10px] leading-none mb-0.5">Роль</p>
              <p className="text-white text-xs font-medium truncate">{current.label}</p>
            </div>
            <Icon name="ChevronsUpDown" size={14} className="text-white/30 flex-shrink-0" />
          </>
        )}
      </button>

      {open && (
        <div className="absolute bottom-full left-0 mb-1 w-72 bg-background border border-border rounded-2xl shadow-2xl overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Переключить роль</p>
          </div>
          <div className="p-1">
            {ROLES.map((r) => (
              <button
                key={r.key}
                onClick={() => handleSelect(r)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors text-left ${
                  role === r.key
                    ? "bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300"
                    : "hover:bg-muted/60 text-foreground"
                }`}
              >
                <div className={`w-8 h-8 bg-gradient-to-br ${ROLE_COLORS[r.key]} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <Icon name={r.icon} size={16} className="text-white" />
                </div>
                <span className="font-medium">{r.label}</span>
                {role === r.key && <Icon name="Check" size={14} className="ml-auto text-violet-600" />}
              </button>
            ))}
          </div>

          {(role === "admin" || role === "manager") && (
            <div className="border-t border-border px-4 py-3 space-y-2.5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Тип тенанта</p>
              <div className="flex gap-2">
                {(["training_center", "organization"] as TenantType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTenantType(t)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                      tenantType === t
                        ? "bg-violet-600 text-white border-violet-600"
                        : "border-border text-muted-foreground hover:bg-muted/60"
                    }`}
                  >
                    {t === "training_center" ? "Учебный центр" : "Организация"}
                  </button>
                ))}
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={canOwnCourses}
                  onChange={(e) => setCanOwnCourses(e.target.checked)}
                  className="rounded accent-violet-600"
                />
                <span className="text-xs text-muted-foreground">Флаг «свои курсы»</span>
              </label>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
