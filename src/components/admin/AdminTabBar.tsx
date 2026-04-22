import Icon from "@/components/ui/icon";
import { useRole } from "@/contexts/RoleContext";

export type AdminTabKey = "stp" | "groups" | "users" | "certificates" | "materials" | "reports" | "settings";

interface AdminTabBarProps {
  activeTab: AdminTabKey;
  setActiveTab: (tab: AdminTabKey) => void;
  hideSettings?: boolean;
  certReadyCount?: number;
}

const tabs: { key: AdminTabKey; icon: string; label: string; narrow: boolean; ucOnly?: boolean }[] = [
  { key: "stp",          icon: "ShieldAlert", label: "STP Индекс Безопасности",  narrow: false },
  { key: "groups",       icon: "UsersRound",  label: "Обучение групп",            narrow: false },
  { key: "users",        icon: "Users",       label: "Индивидуальное обучение",   narrow: false },
  { key: "certificates", icon: "Award",       label: "Удостоверения",             narrow: true, ucOnly: true },
  { key: "materials",    icon: "FolderOpen",  label: "Материалы",                 narrow: true  },
  { key: "reports",      icon: "BarChart2",   label: "Отчёты",                    narrow: true  },
  { key: "settings",     icon: "Settings",    label: "Настройки",                 narrow: true  },
];

export default function AdminTabBar({ activeTab, setActiveTab, hideSettings = false, certReadyCount = 0 }: AdminTabBarProps) {
  const { tenantType } = useRole();
  const isUC = tenantType === "training_center";

  const visibleTabs = tabs.filter((t) => {
    if (t.key === "settings" && hideSettings) return false;
    if (t.ucOnly && !isUC) return false;
    return true;
  });

  return (
    <div className="flex gap-2">
      {visibleTabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => setActiveTab(tab.key)}
          className={`flex flex-col items-center gap-1 py-3 rounded-xl text-xs font-medium transition-all relative ${tab.narrow ? "flex-[0.7]" : "flex-1"} ${
            activeTab === tab.key
              ? "gradient-primary text-white shadow-md shadow-purple-200"
              : "bg-card border border-border text-muted-foreground hover:border-primary hover:text-primary"
          }`}
        >
          <Icon name={tab.icon} size={20} />
          {tab.label}
          {tab.key === "certificates" && certReadyCount > 0 && (
            <span className="absolute top-1.5 right-1.5 bg-amber-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
              {certReadyCount}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}