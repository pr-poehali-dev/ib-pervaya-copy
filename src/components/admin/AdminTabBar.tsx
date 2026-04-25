import Icon from "@/components/ui/icon";
import { useRole } from "@/contexts/RoleContext";

export type AdminTabKey = "stp" | "groups" | "users" | "certificates" | "reports" | "settings";

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
    <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 pb-1 sm:pb-0">
      <div className="flex gap-2 min-w-max sm:min-w-0">
        {visibleTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex flex-col items-center gap-1 py-2.5 sm:py-3 px-3 sm:px-0 rounded-xl text-[10px] sm:text-xs font-medium transition-all relative ${tab.narrow ? "w-16 sm:flex-[0.7]" : "w-20 sm:flex-1"} ${
              activeTab === tab.key
                ? "gradient-primary text-white shadow-md shadow-purple-200"
                : "bg-card border border-border text-muted-foreground hover:border-primary hover:text-primary"
            }`}
          >
            <Icon name={tab.icon} size={18} />
            <span className="leading-tight text-center">{tab.label}</span>
            {tab.key === "certificates" && certReadyCount > 0 && (
              <span className="absolute top-1.5 right-1.5 bg-amber-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                {certReadyCount}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}