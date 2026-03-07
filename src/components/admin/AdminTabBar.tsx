import Icon from "@/components/ui/icon";

type ActiveTab = "stp" | "groups" | "users" | "reports" | "settings";

interface AdminTabBarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

const tabs = [
  { key: "stp", icon: "ShieldAlert", label: "STP Индекс Безопасности", narrow: false },
  { key: "groups", icon: "UsersRound", label: "Обучение групп", narrow: false },
  { key: "users", icon: "Users", label: "Индивидуальное обучение", narrow: false },
  { key: "reports", icon: "BarChart2", label: "Отчёты", narrow: true },
  { key: "settings", icon: "Settings", label: "Настройки", narrow: true },
] as const;

export default function AdminTabBar({ activeTab, setActiveTab }: AdminTabBarProps) {
  return (
    <div className="flex gap-2">
      {tabs.map((tab) => (
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