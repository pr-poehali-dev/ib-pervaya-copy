import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import UserAvatar from "@/components/admin/shared/UserAvatar";
import { User, userColors } from "@/components/admin/types";

interface AddMemberToGroupModalProps {
  groupId: number;
  groupName: string;
  allUsers: User[];
  onClose: () => void;
  onAdd: (userId: number) => void;
}

export default function AddMemberToGroupModal({
  groupId,
  groupName,
  allUsers,
  onClose,
  onAdd,
}: AddMemberToGroupModalProps) {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const availableUsers = useMemo(
    () => allUsers.filter((u) => !u.enrollments.some((e) => e.groupId === groupId)),
    [allUsers, groupId]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return availableUsers;
    return availableUsers.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.organization ?? "").toLowerCase().includes(q)
    );
  }, [availableUsers, search]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-background rounded-2xl shadow-2xl z-10 w-full max-w-md mx-4 flex flex-col max-h-[80vh]">

        {/* Шапка */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <div>
            <h2 className="font-semibold text-base">Добавить слушателя</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Группа {groupName}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <Icon name="X" size={18} />
          </button>
        </div>

        {/* Поиск */}
        {availableUsers.length > 0 && (
          <div className="px-4 py-3 border-b border-border flex-shrink-0">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-muted/30 focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-500/20 transition-all">
              <Icon name="Search" size={14} className="text-muted-foreground flex-shrink-0" />
              <input
                autoFocus
                type="text"
                placeholder="Поиск по имени, email или организации..."
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

        {/* Список */}
        <div className="flex-1 overflow-y-auto">
          {availableUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-center px-6">
              <Icon name="CheckCircle2" size={32} className="text-emerald-500" />
              <p className="font-medium text-sm">Все слушатели уже в этой группе</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-center px-6">
              <Icon name="SearchX" size={28} className="text-muted-foreground" />
              <p className="font-medium text-sm">Ничего не найдено</p>
            </div>
          ) : (
            filtered.map((u, idx) => {
              const isSelected = selectedId === u.id;
              return (
                <button
                  key={u.id}
                  className={`w-full flex items-center gap-3 px-5 py-3 border-b border-border/60 last:border-0 text-left transition-colors ${isSelected ? "bg-violet-50 dark:bg-violet-900/20" : "hover:bg-muted/40"}`}
                  onClick={() => setSelectedId(isSelected ? null : u.id)}
                >
                  <UserAvatar
                    gradient={userColors[idx % userColors.length]}
                    initials={u.initials}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${isSelected ? "text-violet-700 dark:text-violet-300" : ""}`}>
                      {u.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{u.organization || u.email}</p>
                  </div>
                  {u.enrollments.length > 0 && (
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      {u.enrollments.length} гр.
                    </span>
                  )}
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0 ${isSelected ? "border-violet-600 bg-violet-600" : "border-border"}`}>
                    {isSelected && <Icon name="Check" size={11} className="text-white" />}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Футер */}
        <div className="p-4 border-t border-border flex gap-3 flex-shrink-0">
          <Button variant="outline" className="rounded-xl flex-1" onClick={onClose}>Отмена</Button>
          <Button
            className="rounded-xl gradient-primary text-white flex-1 gap-2"
            disabled={selectedId === null}
            onClick={() => {
              if (selectedId !== null) {
                onAdd(selectedId);
                onClose();
              }
            }}
          >
            <Icon name="UserPlus" size={15} />
            Добавить в группу
          </Button>
        </div>
      </div>
    </div>
  );
}
