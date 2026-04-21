import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import { CLIENT_ORGANIZATIONS } from "@/data/mockData";
import type { ClientOrganization } from "@/components/admin/types";

interface ClientOrgsPanelProps {
  onBack: () => void;
}

function OrgModal({
  org,
  onClose,
  onSave,
}: {
  org: ClientOrganization | null;
  onClose: () => void;
  onSave: (data: Omit<ClientOrganization, "id" | "createdAt">) => void;
}) {
  const [name,    setName]    = useState(org?.name ?? "");
  const [inn,     setInn]     = useState(org?.inn ?? "");
  const [person,  setPerson]  = useState(org?.contactPerson ?? "");
  const [email,   setEmail]   = useState(org?.contactEmail ?? "");
  const [phone,   setPhone]   = useState(org?.contactPhone ?? "");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-background rounded-2xl border border-border w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="font-bold text-base">{org ? "Редактировать организацию" : "Добавить организацию"}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted">
            <Icon name="X" size={18} />
          </button>
        </div>
        <div className="p-6 space-y-3">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Название организации</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30" placeholder='ООО «Название»' />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">ИНН</label>
            <input value={inn} onChange={(e) => setInn(e.target.value)} className="w-full h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30" placeholder="7701234567" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Контактное лицо</label>
            <input value={person} onChange={(e) => setPerson(e.target.value)} className="w-full h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30" placeholder="Иванов И.И." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Email</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30" placeholder="email@org.ru" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Телефон</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30" placeholder="+7 (999) 000-00-00" />
            </div>
          </div>
        </div>
        <div className="flex gap-2 p-6 border-t border-border">
          <Button variant="outline" className="flex-1 rounded-xl" onClick={onClose}>Отмена</Button>
          <Button
            className="flex-1 rounded-xl gradient-primary text-white"
            onClick={() => onSave({ name, inn, contactPerson: person, contactEmail: email, contactPhone: phone })}
            disabled={!name.trim() || !inn.trim()}
          >
            Сохранить
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ClientOrgsPanel({ onBack }: ClientOrgsPanelProps) {
  const [orgs, setOrgs]     = useState<ClientOrganization[]>(CLIENT_ORGANIZATIONS);
  const [editOrg, setEditOrg] = useState<ClientOrganization | null | undefined>(undefined);
  const [search, setSearch]   = useState("");

  const filtered = orgs.filter((o) =>
    o.name.toLowerCase().includes(search.toLowerCase()) ||
    o.inn.includes(search)
  );

  function handleSave(data: Omit<ClientOrganization, "id" | "createdAt">) {
    if (editOrg === null) {
      const newOrg: ClientOrganization = {
        ...data,
        id: Math.max(...orgs.map((o) => o.id), 0) + 1,
        createdAt: new Date().toLocaleDateString("ru-RU"),
      };
      setOrgs((prev) => [...prev, newOrg]);
    } else if (editOrg) {
      setOrgs((prev) => prev.map((o) => o.id === editOrg.id ? { ...o, ...data } : o));
    }
    setEditOrg(undefined);
  }

  function handleDelete(id: number) {
    setOrgs((prev) => prev.filter((o) => o.id !== id));
  }

  return (
    <div className="space-y-4">
      {editOrg !== undefined && (
        <OrgModal
          org={editOrg}
          onClose={() => setEditOrg(undefined)}
          onSave={handleSave}
        />
      )}

      <div className="flex items-center gap-3">
        <button onClick={onBack} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-sm">
          <Icon name="ChevronLeft" size={16} />
          Настройки
        </button>
        <span className="text-muted-foreground">/</span>
        <span className="text-sm font-medium">Организации-клиенты</span>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по названию или ИНН..."
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30"
          />
        </div>
        <Button className="gradient-primary text-white rounded-xl gap-2 h-9 flex-shrink-0" onClick={() => setEditOrg(null)}>
          <Icon name="Plus" size={15} />
          Добавить
        </Button>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
            <Icon name="Building" size={16} className="text-white" />
          </div>
          <div>
            <p className="font-semibold text-sm">Организации-клиенты</p>
            <p className="text-xs text-muted-foreground">Компании, для сотрудников которых проводится обучение</p>
          </div>
        </div>

        <div className="divide-y divide-border">
          {filtered.map((org) => (
            <div key={org.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/20 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-muted-foreground">
                    {org.name.replace(/[«»"']/g, "").trim().slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-sm">{org.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground font-mono">{org.inn}</span>
                    {org.contactPerson && (
                      <>
                        <span className="text-muted-foreground/40">·</span>
                        <span className="text-xs text-muted-foreground">{org.contactPerson}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground hidden sm:block">{org.createdAt}</span>
                <button
                  onClick={() => setEditOrg(org)}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                  title="Редактировать"
                >
                  <Icon name="Pencil" size={14} />
                </button>
                <button
                  onClick={() => handleDelete(org.id)}
                  className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-muted-foreground hover:text-red-600 dark:hover:text-red-400"
                  title="Удалить"
                >
                  <Icon name="Trash2" size={14} />
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="px-5 py-10 text-center text-muted-foreground text-sm">
              Организации не найдены
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
