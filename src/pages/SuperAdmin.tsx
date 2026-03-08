import { useState } from "react";
import Layout from "@/components/layout/Layout";
import Icon from "@/components/ui/icon";
import TenantsPanel from "@/components/superadmin/TenantsPanel";
import PlatformCoursesPanel from "@/components/superadmin/PlatformCoursesPanel";
import SalesManagersPanel from "@/components/superadmin/SalesManagersPanel";

type SuperTab = "tenants" | "courses" | "sales" | "profile";

const TABS: { key: SuperTab; icon: string; label: string }[] = [
  { key: "tenants", icon: "Building2",     label: "Тенанты" },
  { key: "courses", icon: "BookOpen",      label: "Каталог курсов" },
  { key: "sales",   icon: "Briefcase",     label: "Менеджеры продаж" },
  { key: "profile", icon: "User",          label: "Профиль" },
];

const STATS = [
  { label: "Тенантов",       value: 5,    icon: "Building2",  color: "from-violet-500 to-purple-700" },
  { label: "Курсов",         value: 18,   icon: "BookOpen",   color: "from-cyan-500 to-blue-600" },
  { label: "Всего подписок", value: 455,  icon: "CreditCard", color: "from-emerald-500 to-teal-600" },
  { label: "Использовано",   value: 297,  icon: "CheckCircle",color: "from-amber-500 to-orange-600" },
];

function ProfilePanel() {
  return (
    <div className="max-w-lg space-y-5">
      <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-700 rounded-2xl flex items-center justify-center">
            <span className="text-white font-bold text-xl">СА</span>
          </div>
          <div>
            <p className="font-bold text-lg">Суперадминистратор</p>
            <p className="text-muted-foreground text-sm">superadmin@platform.ru</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">ФИО</label>
            <input defaultValue="Иван Иванович Иванов" className="w-full h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Email</label>
            <input defaultValue="superadmin@platform.ru" className="w-full h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Новый пароль</label>
            <input type="password" placeholder="••••••••" className="w-full h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30" />
          </div>
        </div>
        <button className="w-full h-9 rounded-xl gradient-primary text-white text-sm font-medium">Сохранить изменения</button>
      </div>
    </div>
  );
}

export default function SuperAdmin() {
  const [activeTab, setActiveTab] = useState<SuperTab>("tenants");

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Заголовок */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-700 rounded-2xl flex items-center justify-center">
            <Icon name="Crown" size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Суперадминистратор</h1>
            <p className="text-muted-foreground text-sm">Управление платформой, тенантами и каталогом курсов</p>
          </div>
        </div>

        {/* Метрики */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {STATS.map((s) => (
            <div key={s.label} className="bg-card rounded-2xl border border-border p-4 flex items-center gap-3">
              <div className={`w-10 h-10 bg-gradient-to-br ${s.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <Icon name={s.icon} size={18} className="text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold leading-none">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Табы */}
        <div className="flex gap-2">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex flex-col items-center gap-1 py-3 flex-1 rounded-xl text-xs font-medium transition-all ${
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

        {/* Контент */}
        {activeTab === "tenants" && <TenantsPanel />}
        {activeTab === "courses" && <PlatformCoursesPanel />}
        {activeTab === "sales"   && <SalesManagersPanel />}
        {activeTab === "profile" && <ProfilePanel />}
      </div>
    </Layout>
  );
}
