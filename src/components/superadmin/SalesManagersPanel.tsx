import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import ManagerCredentialsModal from "./ManagerCredentialsModal";
import type { SalesManager } from "./ManagerCredentialsModal";
import ManagerModal from "./ManagerModal";

// ─── Данные ───────────────────────────────────────────────────────────────────

const MOCK_MANAGERS: SalesManager[] = [
  { id: 1, name: "Константин Воронов", email: "k.voronov@platform.ru",  initials: "КВ", tenantsCount: 3, totalSubscriptions: 350, status: "active",   createdAt: "10.01.2025" },
  { id: 2, name: "Людмила Захарова",  email: "l.zaharova@platform.ru", initials: "ЛЗ", tenantsCount: 2, totalSubscriptions: 80,  status: "active",   createdAt: "22.02.2025" },
  { id: 3, name: "Игорь Кузнецов",   email: "i.kuznecov@platform.ru", initials: "ИК", tenantsCount: 0, totalSubscriptions: 0,   status: "inactive", createdAt: "05.11.2024" },
];

const GRADIENTS = [
  "from-violet-500 to-purple-700",
  "from-cyan-500 to-blue-600",
  "from-emerald-500 to-teal-600",
];

import { generatePassword, copyToClipboard } from "@/lib/authUtils";

// ─── Главный компонент ────────────────────────────────────────────────────────

export default function SalesManagersPanel() {
  const [managers,     setManagers]     = useState<SalesManager[]>(MOCK_MANAGERS);
  const [editManager,  setEditManager]  = useState<SalesManager | null | undefined>(undefined);
  const [credsManager, setCredsManager] = useState<SalesManager | null>(null);

  function handleSave(data: { name: string; email: string; password: string }) {
    if (editManager) {
      setManagers((prev) => prev.map((m) => m.id === editManager.id ? { ...m, name: data.name, email: data.email } : m));
    } else {
      const initials = data.name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
      setManagers((prev) => [...prev, {
        id: Date.now(), name: data.name, email: data.email, initials,
        tenantsCount: 0, totalSubscriptions: 0, status: "active",
        createdAt: new Date().toLocaleDateString("ru-RU"),
      }]);
    }
  }

  function toggleStatus(id: number) {
    setManagers((prev) => prev.map((m) => m.id === id ? { ...m, status: m.status === "active" ? "inactive" : "active" } : m));
  }

  return (
    <div className="space-y-4">
      {editManager !== undefined && (
        <ManagerModal manager={editManager} onClose={() => setEditManager(undefined)} onSave={handleSave} />
      )}
      {credsManager && (
        <ManagerCredentialsModal manager={credsManager} onClose={() => setCredsManager(null)} />
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
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">{m.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{m.email}</p>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-lg text-xs font-medium flex-shrink-0 ${m.status === "active" ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300" : "bg-muted text-muted-foreground"}`}>
                {m.status === "active" ? "Активен" : "Неактивен"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-muted/40 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold">{m.tenantsCount}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Тенантов</p>
              </div>
              <div className="bg-muted/40 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold">{m.totalSubscriptions}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Подписок выдано</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-3">
              <span>Добавлен {m.createdAt}</span>
              <div className="flex items-center gap-1">
                {/* Учётные данные */}
                <button
                  onClick={() => setCredsManager(m)}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                  title="Учётные данные"
                >
                  <Icon name="KeyRound" size={14} />
                </button>
                {/* Редактировать */}
                <button
                  onClick={() => setEditManager(m)}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                  title="Редактировать"
                >
                  <Icon name="Pencil" size={13} />
                </button>
                {/* Вкл / Выкл */}
                <button
                  onClick={() => toggleStatus(m.id)}
                  className={`p-1.5 rounded-lg transition-colors ${m.status === "active" ? "text-emerald-500 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 hover:text-emerald-600" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                  title={m.status === "active" ? "Деактивировать" : "Активировать"}
                >
                  <Icon name={m.status === "active" ? "ToggleRight" : "ToggleLeft"} size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
