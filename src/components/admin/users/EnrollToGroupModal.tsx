import { useState } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { User, Group } from "@/components/admin/types";
import { GROUPS_DATA } from "@/data/mockData";

interface EnrollToGroupModalProps {
  user: User;
  onClose: () => void;
  onEnroll: (userId: number, groupId: number) => void;
}

export default function EnrollToGroupModal({ user, onClose, onEnroll }: EnrollToGroupModalProps) {
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-background rounded-2xl shadow-2xl z-10 w-full max-w-md mx-4 flex flex-col max-h-[80vh]">

        {/* Шапка */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <div>
            <h2 className="font-semibold text-base">Добавить в группу</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{user.name}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <Icon name="X" size={18} />
          </button>
        </div>

        {/* Текущие группы */}
        {user.enrollments.length > 0 && (
          <div className="px-5 py-3 border-b border-border bg-muted/30 flex-shrink-0">
            <p className="text-xs font-medium text-muted-foreground mb-2">Уже в группах:</p>
            <div className="flex flex-wrap gap-1.5">
              {user.enrollments.map((e) => (
                <span key={e.groupId} className="px-2 py-0.5 text-xs rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 font-medium">
                  {e.groupName}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Список групп */}
        <div className="flex-1 overflow-y-auto">
          {availableGroups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-center px-6">
              <Icon name="CheckCircle2" size={32} className="text-emerald-500" />
              <p className="font-medium text-sm">Пользователь уже во всех группах</p>
              <p className="text-xs text-muted-foreground">Новых групп для добавления нет</p>
            </div>
          ) : (
            availableGroups.map((g) => {
              const isSelected = selectedGroupId === g.id;
              return (
                <button
                  key={g.id}
                  className={`w-full flex items-center justify-between px-5 py-3.5 border-b border-border/60 last:border-0 text-left transition-colors ${isSelected ? "bg-violet-50 dark:bg-violet-900/20" : "hover:bg-muted/40"}`}
                  onClick={() => setSelectedGroupId(isSelected ? null : g.id)}
                >
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm ${isSelected ? "text-violet-700 dark:text-violet-300" : ""}`}>
                      {g.name}
                    </p>
                    {g.clientOrganizationName && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{g.clientOrganizationName}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[g.status]}`}>
                      {statusLabel[g.status]}
                    </span>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? "border-violet-600 bg-violet-600" : "border-border"}`}>
                      {isSelected && <Icon name="Check" size={11} className="text-white" />}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Футер */}
        <div className="p-4 border-t border-border flex gap-3 flex-shrink-0">
          <Button variant="outline" className="rounded-xl flex-1" onClick={onClose}>
            Отмена
          </Button>
          <Button
            className="rounded-xl gradient-primary text-white flex-1 gap-2"
            disabled={selectedGroupId === null}
            onClick={() => {
              if (selectedGroupId !== null) {
                onEnroll(user.id, selectedGroupId);
                onClose();
              }
            }}
          >
            <Icon name="UserPlus" size={15} />
            Зачислить
          </Button>
        </div>
      </div>
    </div>
  );
}
