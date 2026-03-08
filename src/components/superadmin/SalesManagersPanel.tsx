import { useState } from "react";
import Icon from "@/components/ui/icon";
import Tip from "@/components/ui/tip";
import { Button } from "@/components/ui/button";

interface SalesManager {
  id: number;
  name: string;
  email: string;
  initials: string;
  tenantsCount: number;
  totalSubscriptions: number;
  status: "active" | "inactive";
  createdAt: string;
}

const MOCK_MANAGERS: SalesManager[] = [
  { id: 1, name: "Константин Воронов",  email: "k.voronov@platform.ru",  initials: "КВ", tenantsCount: 3, totalSubscriptions: 350, status: "active",   createdAt: "10.01.2025" },
  { id: 2, name: "Людмила Захарова",   email: "l.zaharova@platform.ru", initials: "ЛЗ", tenantsCount: 2, totalSubscriptions: 80,  status: "active",   createdAt: "22.02.2025" },
  { id: 3, name: "Игорь Кузнецов",    email: "i.kuznecov@platform.ru", initials: "ИК", tenantsCount: 0, totalSubscriptions: 0,   status: "inactive", createdAt: "05.11.2024" },
];

const GRADIENTS = [
  "from-violet-500 to-purple-700",
  "from-cyan-500 to-blue-600",
  "from-emerald-500 to-teal-600",
];

interface ManagerModalProps {
  manager: SalesManager | null;
  onClose: () => void;
}

function ManagerModal({ manager, onClose }: ManagerModalProps) {
  const [name, setName] = useState(manager?.name ?? "");
  const [email, setEmail] = useState(manager?.email ?? "");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-background rounded-2xl border border-border w-full max-w-sm p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg">{manager ? "Редактировать менеджера" : "Добавить менеджера"}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted"><Icon name="X" size={18} /></button>
        </div>
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">ФИО</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30" placeholder="Фамилия Имя Отчество" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30" placeholder="email@platform.ru" />
          </div>
        </div>
        <div className="flex gap-2 pt-1">
          <Button variant="outline" className="flex-1 rounded-xl" onClick={onClose}>Отмена</Button>
          <Button className="flex-1 rounded-xl gradient-primary text-white" onClick={onClose}>Сохранить</Button>
        </div>
      </div>
    </div>
  );
}

export default function SalesManagersPanel() {
  const [managers] = useState<SalesManager[]>(MOCK_MANAGERS);
  const [editManager, setEditManager] = useState<SalesManager | null | undefined>(undefined);

  return (
    <div className="space-y-4">
      {editManager !== undefined && (
        <ManagerModal manager={editManager} onClose={() => setEditManager(undefined)} />
      )}

      <div className="flex justify-end">
        <Button className="gradient-primary text-white rounded-xl gap-2 h-9" onClick={() => setEditManager(null)}>
          <Icon name="Plus" size={15} />
          Добавить менеджера
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {managers.map((m, idx) => (
          <div key={m.id} className="bg-card rounded-2xl border border-border p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 bg-gradient-to-br ${GRADIENTS[idx % GRADIENTS.length]} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <span className="text-white font-bold text-sm">{m.initials}</span>
                </div>
                <div>
                  <p className="font-semibold text-sm">{m.name}</p>
                  <p className="text-xs text-muted-foreground">{m.email}</p>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-lg text-xs font-medium flex-shrink-0 ${m.status === "active" ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300" : "bg-muted text-muted-foreground"}`}>
                {m.status === "active" ? "Активен" : "Неактивен"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-muted/40 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-foreground">{m.tenantsCount}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Тенантов</p>
              </div>
              <div className="bg-muted/40 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-foreground">{m.totalSubscriptions}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Подписок выдано</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Добавлен {m.createdAt}</span>
              <div className="flex items-center gap-1">
                <Tip text="Редактировать">
                  <button className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" onClick={() => setEditManager(m)}>
                    <Icon name="Pencil" size={13} />
                  </button>
                </Tip>
                <Tip text={m.status === "active" ? "Деактивировать" : "Активировать"}>
                  <button className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-emerald-600">
                    <Icon name={m.status === "active" ? "ToggleRight" : "ToggleLeft"} size={16} />
                  </button>
                </Tip>
                <Tip text="Сбросить пароль">
                  <button className="p-1.5 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors text-muted-foreground hover:text-amber-600">
                    <Icon name="KeyRound" size={13} />
                  </button>
                </Tip>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
