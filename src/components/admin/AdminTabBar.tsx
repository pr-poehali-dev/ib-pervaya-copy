import Icon from "@/components/ui/icon";

type ActiveTab = "stp" | "groups" | "users" | "reports" | "settings";

interface AdminTabBarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

const tabs = [
  { key: "stp", icon: "ShieldAlert", label: "STP Индекс Безопасности" },
  { key: "groups", icon: "UsersRound", label: "Обучение групп" },
  { key: "users", icon: "Users", label: "Индивидуальное обучение" },
  { key: "reports", icon: "BarChart2", label: "Отчёты" },
  { key: "settings", icon: "Settings", label: "Настройки" },
] as const;

export default function AdminTabBar({ activeTab, setActiveTab }: AdminTabBarProps) {
  return (
    <div className="flex gap-2">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => setActiveTab(tab.key)}
          className={`flex flex-col items-center gap-1 px-6 py-3 rounded-xl text-xs font-medium transition-all ${
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