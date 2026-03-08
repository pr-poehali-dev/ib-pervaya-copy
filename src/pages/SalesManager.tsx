import { useState } from "react";
import Layout from "@/components/layout/Layout";
import Icon from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Tip from "@/components/ui/tip";

type SalesTab = "tenants" | "stats" | "invoices" | "profile";

const TABS: { key: SalesTab; icon: string; label: string }[] = [
  { key: "tenants",  icon: "Building2",  label: "Тенанты" },
  { key: "stats",    icon: "BarChart2",  label: "Статистика" },
  { key: "invoices", icon: "Receipt",    label: "Счета" },
  { key: "profile",  icon: "User",       label: "Профиль" },
];

const HEADER_STATS = [
  { label: "Моих тенантов",     value: 3,   icon: "Building2",  color: "from-violet-500 to-purple-700" },
  { label: "Выдано подписок",   value: 350, icon: "CreditCard", color: "from-cyan-500 to-blue-600" },
  { label: "Использовано",      value: 266, icon: "CheckCircle",color: "from-emerald-500 to-teal-600" },
  { label: "Счетов в месяце",   value: 2,   icon: "Receipt",    color: "from-amber-500 to-orange-600" },
];

interface Tenant {
  id: number;
  name: string;
  inn: string;
  type: "training_center" | "organization";
  subscriptions: number;
  usedSubscriptions: number;
  studentsCount: number;
  status: "active" | "inactive";
}

const MY_TENANTS: Tenant[] = [
  { id: 1, name: "ООО «ТехноПром»",    inn: "7701234567", type: "training_center", subscriptions: 100, usedSubscriptions: 43, studentsCount: 18, status: "active" },
  { id: 2, name: "АО «СтройГрупп»",    inn: "7709876543", type: "organization",    subscriptions: 50,  usedSubscriptions: 28, studentsCount: 12, status: "active" },
  { id: 3, name: "ГУП «Энергосеть»",   inn: "5001234000", type: "training_center", subscriptions: 200, usedSubscriptions: 195, studentsCount: 45, status: "active" },
];

function TenantsTab() {
  const [showSubModal, setShowSubModal] = useState<Tenant | null>(null);
  const [subsAmount, setSubsAmount] = useState("50");

  return (
    <div className="space-y-4">
      {showSubModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-background rounded-2xl border border-border w-full max-w-sm p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg">Пополнить подписки</h2>
              <button onClick={() => setShowSubModal(null)} className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted"><Icon name="X" size={18} /></button>
            </div>
            <p className="text-sm text-muted-foreground">{showSubModal.name}</p>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Количество подписок</label>
              <input type="number" value={subsAmount} onChange={(e) => setSubsAmount(e.target.value)} min="1" className="w-full h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setShowSubModal(null)}>Отмена</Button>
              <Button className="flex-1 rounded-xl gradient-primary text-white" onClick={() => setShowSubModal(null)}>Выдать</Button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Организация</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Тип</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Подписки</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Слушателей</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Статус</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Действия</th>
            </tr>
          </thead>
          <tbody>
            {MY_TENANTS.map((t) => {
              const pct = t.subscriptions > 0 ? Math.round((t.usedSubscriptions / t.subscriptions) * 100) : 0;
              const warn = pct >= 90;
              return (
                <tr key={t.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium">{t.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{t.inn}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary" className={`text-xs ${t.type === "training_center" ? "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300" : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"}`}>
                      {t.type === "training_center" ? "Учебный центр" : "Организация"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-1 min-w-[120px]">
                      <div className="flex justify-between text-xs">
                        <span className={warn ? "text-red-500 font-medium" : "text-muted-foreground"}>{t.usedSubscriptions} / {t.subscriptions}</span>
                        <span className={warn ? "text-red-500 font-bold" : "text-muted-foreground"}>{pct}%</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${warn ? "bg-red-500" : "bg-gradient-to-r from-violet-500 to-cyan-500"}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">{t.studentsCount}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${t.status === "active" ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300" : "bg-muted text-muted-foreground"}`}>
                      {t.status === "active" ? "Активен" : "Неактивен"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Tip text="Пополнить подписки">
                      <button className="p-1.5 rounded-lg hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors text-violet-600" onClick={() => setShowSubModal(t)}>
                        <Icon name="PlusCircle" size={15} />
                      </button>
                    </Tip>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatsTab() {
  const tenantStats = MY_TENANTS.map((t) => ({
    ...t,
    pct: t.subscriptions > 0 ? Math.round((t.usedSubscriptions / t.subscriptions) * 100) : 0,
  }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tenantStats.map((t) => (
          <div key={t.id} className="bg-card rounded-2xl border border-border p-5 space-y-4">
            <p className="font-semibold">{t.name}</p>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Использование подписок</span>
                  <span className="font-medium">{t.pct}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${t.pct >= 90 ? "bg-red-500" : "bg-gradient-to-r from-violet-500 to-cyan-500"}`} style={{ width: `${t.pct}%` }} />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{t.usedSubscriptions} использовано</span>
                  <span>{t.subscriptions - t.usedSubscriptions} осталось</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-muted/40 rounded-xl p-2.5 text-center">
                  <p className="text-lg font-bold">{t.studentsCount}</p>
                  <p className="text-[10px] text-muted-foreground">Слушателей</p>
                </div>
                <div className="bg-muted/40 rounded-xl p-2.5 text-center">
                  <p className="text-lg font-bold">{t.subscriptions}</p>
                  <p className="text-[10px] text-muted-foreground">Подписок</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface Invoice {
  id: number;
  tenant: string;
  amount: number;
  subscriptions: number;
  date: string;
  status: "paid" | "pending" | "cancelled";
}

const MOCK_INVOICES: Invoice[] = [
  { id: 1, tenant: "ООО «ТехноПром»",  amount: 45000, subscriptions: 50,  date: "01.03.2026", status: "paid"      },
  { id: 2, tenant: "АО «СтройГрупп»",  amount: 27000, subscriptions: 30,  date: "15.02.2026", status: "paid"      },
  { id: 3, tenant: "ГУП «Энергосеть»", amount: 90000, subscriptions: 100, date: "08.03.2026", status: "pending"   },
  { id: 4, tenant: "ООО «ТехноПром»",  amount: 18000, subscriptions: 20,  date: "20.01.2026", status: "cancelled" },
];

const STATUS_MAP: Record<Invoice["status"], { label: string; cls: string }> = {
  paid:      { label: "Оплачен",  cls: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300" },
  pending:   { label: "Ожидает", cls: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300" },
  cancelled: { label: "Отменён", cls: "bg-muted text-muted-foreground" },
};

function InvoicesTab() {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button className="gradient-primary text-white rounded-xl gap-2 h-9">
          <Icon name="FilePlus" size={15} />
          Выставить счёт
        </Button>
      </div>
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Тенант</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Подписок</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Сумма</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Дата</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Статус</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Действия</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_INVOICES.map((inv) => (
              <tr key={inv.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3 font-medium">{inv.tenant}</td>
                <td className="px-4 py-3 text-muted-foreground">{inv.subscriptions}</td>
                <td className="px-4 py-3 font-medium">{inv.amount.toLocaleString("ru")} ₽</td>
                <td className="px-4 py-3 text-muted-foreground">{inv.date}</td>
                <td className="px-4 py-3">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${STATUS_MAP[inv.status].cls}`}>{STATUS_MAP[inv.status].label}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Tip text="Скачать счёт">
                      <button className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                        <Icon name="Download" size={14} />
                      </button>
                    </Tip>
                    {inv.status === "pending" && (
                      <Tip text="Отметить оплаченным">
                        <button className="p-1.5 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors text-muted-foreground hover:text-emerald-600">
                          <Icon name="CheckCircle" size={14} />
                        </button>
                      </Tip>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProfilePanel() {
  return (
    <div className="max-w-lg space-y-5">
      <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center">
            <span className="text-white font-bold text-xl">МП</span>
          </div>
          <div>
            <p className="font-bold text-lg">Менеджер продаж</p>
            <p className="text-muted-foreground text-sm">k.voronov@platform.ru</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">ФИО</label>
            <input defaultValue="Константин Воронов" className="w-full h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Email</label>
            <input defaultValue="k.voronov@platform.ru" className="w-full h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30" />
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

export default function SalesManager() {
  const [activeTab, setActiveTab] = useState<SalesTab>("tenants");

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center">
            <Icon name="Briefcase" size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Менеджер продаж</h1>
            <p className="text-muted-foreground text-sm">Управление тенантами, подписками и счетами</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {HEADER_STATS.map((s) => (
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

        {activeTab === "tenants"  && <TenantsTab />}
        {activeTab === "stats"    && <StatsTab />}
        {activeTab === "invoices" && <InvoicesTab />}
        {activeTab === "profile"  && <ProfilePanel />}
      </div>
    </Layout>
  );
}