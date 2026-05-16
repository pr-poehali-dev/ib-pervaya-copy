import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { User, Group } from "@/components/admin/types";
import { GROUPS_DATA } from "@/data/mockData";

interface EnrollToGroupModalProps {
  user: User;
  onClose: () => void;
  onEnroll: (userId: number, groupId: number) => void;
  onUnenroll: (userId: number, groupId: number) => void;
}

type Tab = "add" | "remove";

export default function EnrollToGroupModal({ user, onClose, onEnroll, onUnenroll }: EnrollToGroupModalProps) {
  const [tab, setTab] = useState<Tab>("add");
  const [search, setSearch] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [openOrgs, setOpenOrgs] = useState<Set<string>>(new Set());
  const [confirmGroupId, setConfirmGroupId] = useState<number | null>(null);

  const enrolledGroupIds = new Set(user.enrollments.map((e) => e.groupId));
  const availableGroups = GROUPS_DATA.filter((g) => !enrolledGroupIds.has(g.id));

  const statusLabel: Record<Group["status"], string> = {
    active: "Активная",
    forming: "Формируется",
    completed: "Завершена",
  };
  const statusColor: Record<Group["status"], string> = {
    active: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20",
    forming: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20",
    completed: "text-muted-foreground bg-muted",
  };

  const filteredGroups = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return availableGroups;
    return availableGroups.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        (g.clientOrganizationName ?? "").toLowerCase().includes(q)
    );
  }, [availableGroups, search]);

  const groupedByOrg = useMemo(() => {
    const map = new Map<string, Group[]>();
    for (const g of filteredGroups) {
      const org = g.clientOrganizationName ?? "Без организации";
      if (!map.has(org)) map.set(org, []);
      map.get(org)!.push(g);
    }
    return map;
  }, [filteredGroups]);

  const allOrgs = useMemo(() => Array.from(groupedByOrg.keys()), [groupedByOrg]);

  const effectiveOpenOrgs = useMemo(() => {
    if (search.trim()) return new Set(allOrgs);
    return openOrgs;
  }, [search, allOrgs, openOrgs]);

  function toggleOrg(org: string) {
    setOpenOrgs((prev) => {
      const next = new Set(prev);
      if (next.has(org)) next.delete(org); else next.add(org);
      return next;
    });
  }

  function handleTabChange(t: Tab) {
    setTab(t);
    setSearch("");
    setSelectedGroupId(null);
    setConfirmGroupId(null);
    setOpenOrgs(new Set());
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-background rounded-2xl shadow-2xl z-10 w-full max-w-md mx-4 flex flex-col max-h-[82vh]">

        {/* Шапка */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <div>
            <h2 className="font-semibold text-base">Управление группами</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{user.name}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <Icon name="X" size={18} />
          </button>
        </div>

        {/* Вкладки */}
        <div className="flex border-b border-border flex-shrink-0">
          <button
            className={`flex-1 py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${tab === "add" ? "text-violet-600 dark:text-violet-400 border-b-2 border-violet-600" : "text-muted-foreground hover:text-foreground"}`}
            onClick={() => handleTabChange("add")}
          >
            <Icon name="UserPlus" size={14} />
            Добавить
            {availableGroups.length > 0 && (
              <span className="px-1.5 py-0.5 text-xs rounded-full bg-muted font-medium">{availableGroups.length}</span>
            )}
          </button>
          <button
            className={`flex-1 py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${tab === "remove" ? "text-red-600 dark:text-red-400 border-b-2 border-red-500" : "text-muted-foreground hover:text-foreground"}`}
            onClick={() => handleTabChange("remove")}
          >
            <Icon name="UserMinus" size={14} />
            Исключить
            {user.enrollments.length > 0 && (
              <span className="px-1.5 py-0.5 text-xs rounded-full bg-muted font-medium">{user.enrollments.length}</span>
            )}
          </button>
        </div>

        {/* Поиск (только на вкладке "Добавить") */}
        {tab === "add" && availableGroups.length > 0 && (
          <div className="px-4 py-3 border-b border-border flex-shrink-0">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-muted/30 focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-500/20 transition-all">
              <Icon name="Search" size={14} className="text-muted-foreground flex-shrink-0" />
              <input
                autoFocus
                type="text"
                placeholder="Поиск по группе или организации..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              {search && (
                <button onClick={() => setSearch("")} className="text-muted-foreground hover:text-foreground transition-colors">
                  <Icon name="X" size={13} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Содержимое */}
        <div className="flex-1 overflow-y-auto">

          {/* ── Добавить ── */}
          {tab === "add" && (
            availableGroups.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2 text-center px-6">
                <Icon name="CheckCircle2" size={32} className="text-emerald-500" />
                <p className="font-medium text-sm">Пользователь уже во всех группах</p>
              </div>
            ) : filteredGroups.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2 text-center px-6">
                <Icon name="SearchX" size={28} className="text-muted-foreground" />
                <p className="font-medium text-sm">Ничего не найдено</p>
                <p className="text-xs text-muted-foreground">Попробуйте другой запрос</p>
              </div>
            ) : (
              allOrgs.map((org) => {
                const groups = groupedByOrg.get(org)!;
                const isOpen = effectiveOpenOrgs.has(org);
                return (
                  <div key={org} className="border-b border-border last:border-0">
                    <button
                      className="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-muted/30 transition-colors"
                      onClick={() => toggleOrg(org)}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Icon name={isOpen ? "ChevronDown" : "ChevronRight"} size={14} className="text-muted-foreground flex-shrink-0" />
                        <span className="font-medium text-sm truncate">{org}</span>
                      </div>
                      <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">{groups.length}</span>
                    </button>

                    {isOpen && groups.map((g) => {
                      const isSelected = selectedGroupId === g.id;
                      return (
                        <button
                          key={g.id}
                          className={`w-full flex items-center justify-between pl-10 pr-5 py-3 border-t border-border/40 text-left transition-colors ${isSelected ? "bg-violet-50 dark:bg-violet-900/20" : "hover:bg-muted/30"}`}
                          onClick={() => setSelectedGroupId(isSelected ? null : g.id)}
                        >
                          <p className={`text-sm font-medium flex-1 min-w-0 truncate ${isSelected ? "text-violet-700 dark:text-violet-300" : ""}`}>
                            {g.name}
                          </p>
                          <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[g.status]}`}>
                              {statusLabel[g.status]}
                            </span>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0 ${isSelected ? "border-violet-600 bg-violet-600" : "border-border"}`}>
                              {isSelected && <Icon name="Check" size={11} className="text-white" />}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                );
              })
            )
          )}

          {/* ── Исключить ── */}
          {tab === "remove" && (
            user.enrollments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2 text-center px-6">
                <Icon name="Users" size={32} className="text-muted-foreground" />
                <p className="font-medium text-sm">Пользователь не состоит в группах</p>
              </div>
            ) : (
              user.enrollments.map((e) => {
                const g = GROUPS_DATA.find((grp) => grp.id === e.groupId);
                const isConfirm = confirmGroupId === e.groupId;
                return (
                  <div
                    key={e.groupId}
                    className={`flex items-center justify-between px-5 py-3.5 border-b border-border/60 last:border-0 transition-colors ${isConfirm ? "bg-red-50 dark:bg-red-900/10" : ""}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{e.groupName}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {g?.clientOrganizationName && (
                          <p className="text-xs text-muted-foreground truncate">{g.clientOrganizationName}</p>
                        )}
                        {e.assignments.length > 0 && (
                          <span className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-0.5 flex-shrink-0">
                            <Icon name="BookOpen" size={10} />
                            {e.assignments.length} курс{e.assignments.length === 1 ? "" : e.assignments.length < 5 ? "а" : "ов"}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="ml-3 flex-shrink-0">
                      {isConfirm ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-red-600 dark:text-red-400 font-medium">Исключить?</span>
                          <button
                            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 transition-colors"
                            onClick={() => { onUnenroll(user.id, e.groupId); setConfirmGroupId(null); }}
                          >Да</button>
                          <button
                            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
                            onClick={() => setConfirmGroupId(null)}
                          >Нет</button>
                        </div>
                      ) : (
                        <button
                          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          onClick={() => setConfirmGroupId(e.groupId)}
                        >
                          <Icon name="UserMinus" size={12} />
                          Исключить
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )
          )}
        </div>

        {/* Футер */}
        <div className="p-4 border-t border-border flex gap-3 flex-shrink-0">
          <Button variant="outline" className="rounded-xl flex-1" onClick={onClose}>Закрыть</Button>
          {tab === "add" && (
            <Button
              className="rounded-xl gradient-primary text-white flex-1 gap-2"
              disabled={selectedGroupId === null}
              onClick={() => {
                if (selectedGroupId !== null) {
                  onEnroll(user.id, selectedGroupId);
                  setSelectedGroupId(null);
                  setSearch("");
                }
              }}
            >
              <Icon name="UserPlus" size={15} />
              Зачислить
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
