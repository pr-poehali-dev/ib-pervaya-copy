import Icon from "@/components/ui/icon";

export type AdminTabKey = "stp" | "groups" | "users" | "reports" | "settings";

interface AdminTabBarProps {
  activeTab: AdminTabKey;
  setActiveTab: (tab: AdminTabKey) => void;
  hideSettings?: boolean;
}

const tabs: { key: AdminTabKey; icon: string; label: string; narrow: boolean }[] = [
  { key: "stp",      icon: "ShieldAlert", label: "STP Индекс Безопасности",  narrow: false },
  { key: "groups",   icon: "UsersRound",  label: "Обучение групп",            narrow: false },
  { key: "users",    icon: "Users",       label: "Индивидуальное обучение",   narrow: false },
  { key: "reports",  icon: "BarChart2",   label: "Отчёты",                    narrow: true  },
  { key: "settings", icon: "Settings",    label: "Настройки",                 narrow: true  },
];

export default function AdminTabBar({ activeTab, setActiveTab, hideSettings = false }: AdminTabBarProps) {
  const visibleTabs = hideSettings ? tabs.filter((t) => t.key !== "settings") : tabs;

  return (
    <div className="flex gap-2">
      {visibleTabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => setActiveTab(tab.key)}
          className={`flex flex-col items-center gap-1 py-3 rounded-xl text-xs font-medium transition-all ${tab.narrow ? "flex-[0.7]" : "flex-1"} ${
            activeTab === tab.key
              ? "gradient-primary text-white shadow-md shadow-purple-200"
              : "bg-card border border-border text-muted-foreground hover:border-primary hover:text-primary"
          }`}
        >
          <Icon name={tab.icon} size={20} />
          {tab.label}
        </button>
      ))}
    </div>
  );
}
