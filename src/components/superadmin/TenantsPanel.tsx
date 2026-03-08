import { useState } from "react";
import Icon from "@/components/ui/icon";
import Tip from "@/components/ui/tip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type TenantType = "training_center" | "organization";

interface Tenant {
  id: number;
  name: string;
  inn: string;
  type: TenantType;
  subscriptions: number;
  usedSubscriptions: number;
  canOwnCourses: boolean;
  managersCount: number;
  studentsCount: number;
  status: "active" | "inactive";
  createdAt: string;
}

const MOCK_TENANTS: Tenant[] = [
  { id: 1, name: "ООО «ТехноПром»",      inn: "7701234567", type: "training_center", subscriptions: 100, usedSubscriptions: 43, canOwnCourses: true,  managersCount: 2, studentsCount: 18, status: "active",   createdAt: "12.01.2025" },
  { id: 2, name: "АО «СтройГрупп»",      inn: "7709876543", type: "organization",    subscriptions: 50,  usedSubscriptions: 28, canOwnCourses: false, managersCount: 1, studentsCount: 12, status: "active",   createdAt: "03.03.2025" },
  { id: 3, name: "ГУП «Энергосеть»",     inn: "5001234000", type: "training_center", subscriptions: 200, usedSubscriptions: 195, canOwnCourses: true, managersCount: 3, studentsCount: 45, status: "active",   createdAt: "17.09.2024" },
  { id: 4, name: "ПАО «МеталлСервис»",   inn: "6612345678", type: "organization",    subscriptions: 30,  usedSubscriptions: 0,  canOwnCourses: false, managersCount: 1, studentsCount: 0,  status: "inactive", createdAt: "01.02.2025" },
  { id: 5, name: "ООО «АгроЛогистик»",   inn: "3301122334", type: "organization",    subscriptions: 75,  usedSubscriptions: 31, canOwnCourses: false, managersCount: 2, studentsCount: 9,  status: "active",   createdAt: "20.11.2024" },
];

function TenantModal({ tenant, onClose }: { tenant: Tenant | null; onClose: () => void }) {
  const [name, setName] = useState(tenant?.name ?? "");
  const [inn, setInn] = useState(tenant?.inn ?? "");
  const [type, setType] = useState<TenantType>(tenant?.type ?? "organization");
  const [subs, setSubs] = useState(String(tenant?.subscriptions ?? "50"));
  const [ownCourses, setOwnCourses] = useState(tenant?.canOwnCourses ?? false);

  if (!open && !tenant) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-background rounded-2xl border border-border w-full max-w-md p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg">{tenant ? "Редактировать тенанта" : "Добавить тенанта"}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted"><Icon name="X" size={18} /></button>
        </div>
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Название организации</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30" placeholder="ООО «Название»" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">ИНН</label>
            <input value={inn} onChange={(e) => setInn(e.target.value)} className="w-full h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30" placeholder="1234567890" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Тип тенанта</label>
            <div className="flex gap-2">
              {(["training_center", "organization"] as TenantType[]).map((t) => (
                <button key={t} onClick={() => setType(t)} className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors ${type === t ? "bg-violet-600 text-white border-violet-600" : "border-border text-muted-foreground hover:bg-muted/60"}`}>
                  {t === "training_center" ? "Учебный центр" : "Организация"}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Количество подписок</label>
            <input type="number" value={subs} onChange={(e) => setSubs(e.target.value)} className="w-full h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30" min="0" />
          </div>
          <label className="flex items-center gap-2.5 cursor-pointer p-3 rounded-xl border border-border hover:bg-muted/40 transition-colors">
            <input type="checkbox" checked={ownCourses} onChange={(e) => setOwnCourses(e.target.checked)} className="rounded accent-violet-600 w-4 h-4" />
            <div>
              <p className="text-sm font-medium">Свои курсы</p>
              <p className="text-xs text-muted-foreground">Тенант может загружать и использовать собственные курсы (не списывают подписки)</p>
            </div>
          </label>
        </div>
        <div className="flex gap-2 pt-1">
          <Button variant="outline" className="flex-1 rounded-xl" onClick={onClose}>Отмена</Button>
          <Button className="flex-1 rounded-xl gradient-primary text-white" onClick={onClose}>Сохранить</Button>
        </div>
      </div>
    </div>
  );
}

export default function TenantsPanel() {
  const [tenants] = useState<Tenant[]>(MOCK_TENANTS);
  const [editTenant, setEditTenant] = useState<Tenant | null | undefined>(undefined);
  const [search, setSearch] = useState("");

  const filtered = tenants.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.inn.includes(search)
  );

  return (
    <div className="space-y-4">
      {editTenant !== undefined && (
        <TenantModal tenant={editTenant} onClose={() => setEditTenant(undefined)} />
      )}

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по названию или ИНН..."
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30"
          />
        </div>
        <Button className="gradient-primary text-white rounded-xl gap-2 h-9" onClick={() => setEditTenant(null)}>
          <Icon name="Plus" size={15} />
          Добавить тенанта
        </Button>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Организация</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">ИНН</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Тип</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">Подписки</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">Свои курсы</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Менеджеры</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Слушатели</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Статус</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Управление</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t, idx) => {
                const subsPercent = t.subscriptions > 0 ? Math.round((t.usedSubscriptions / t.subscriptions) * 100) : 0;
                const subsWarning = subsPercent >= 90;
                return (
                  <tr key={t.id} className={`border-b border-border last:border-0 hover:bg-muted/20 transition-colors ${idx % 2 === 0 ? "" : "bg-muted/5"}`}>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.createdAt}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{t.inn}</td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary" className={`text-xs ${t.type === "training_center" ? "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300" : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"}`}>
                        {t.type === "training_center" ? "Учебный центр" : "Организация"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1 min-w-[120px]">
                        <div className="flex justify-between text-xs">
                          <span className={subsWarning ? "text-red-500 font-medium" : "text-muted-foreground"}>{t.usedSubscriptions} / {t.subscriptions}</span>
                          <span className={subsWarning ? "text-red-500 font-bold" : "text-muted-foreground"}>{subsPercent}%</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${subsWarning ? "bg-red-500" : "bg-gradient-to-r from-violet-500 to-cyan-500"}`}
                            style={{ width: `${subsPercent}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {t.canOwnCourses
                        ? <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1"><Icon name="Check" size={14} />Да</span>
                        : <span className="text-muted-foreground flex items-center gap-1"><Icon name="Minus" size={14} />Нет</span>
                      }
                    </td>
                    <td className="px-4 py-3 text-center">{t.managersCount}</td>
                    <td className="px-4 py-3 text-center">{t.studentsCount}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${t.status === "active" ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300" : "bg-muted text-muted-foreground"}`}>
                        {t.status === "active" ? "Активен" : "Неактивен"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Tip text="Редактировать">
                          <button className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" onClick={() => setEditTenant(t)}>
                            <Icon name="Pencil" size={15} />
                          </button>
                        </Tip>
                        <Tip text="Пополнить подписки">
                          <button className="p-1.5 rounded-lg hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors text-violet-600 dark:text-violet-400">
                            <Icon name="PlusCircle" size={15} />
                          </button>
                        </Tip>
                        <Tip text={t.status === "active" ? "Деактивировать" : "Активировать"}>
                          <button className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-emerald-600">
                            <Icon name={t.status === "active" ? "ToggleRight" : "ToggleLeft"} size={16} />
                          </button>
                        </Tip>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="p-10 text-center">
            <Icon name="SearchX" size={32} className="text-muted-foreground mx-auto mb-3" />
            <p className="font-medium">Тенанты не найдены</p>
          </div>
        )}
      </div>
    </div>
  );
}
