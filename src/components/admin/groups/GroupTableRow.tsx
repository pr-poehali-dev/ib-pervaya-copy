import { useState } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import Tip from "@/components/ui/tip";
import GroupMemberRow from "./GroupMemberRow";
import UserAvatar from "@/components/admin/shared/UserAvatar";
import ProgressBar from "@/components/admin/shared/ProgressBar";
import { User, Group, gradients } from "@/components/admin/types";
import { getGroupStatus, getMemberAssignments } from "./groupsUtils";

function statusBadgeClass(status: string) {
  if (status === "Обучается") return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300";
  if (status === "Завершено") return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300";
  return "bg-muted text-muted-foreground";
}

interface GroupTableRowProps {
  group: Group;
  idx: number;
  organization: string;
  inn: string;
  members: User[];
  isExpanded: boolean;
  isSelected: boolean;
  expandedMembers: Set<number>;
  onToggleGroup: (groupName: string) => void;
  onToggleSelect: (groupName: string) => void;
  onToggleMember: (userId: number) => void;
  onOpenGroupStats: (groupName: string) => void;
  onOpenUserStats: (user: User) => void;
  onAddCourseForGroup: (groupId: number) => void;
  onAddCourseForMember: (userId: number, groupId: number) => void;
  onActivateCourse: (userId: number, courseId: number, date?: string, groupId?: number) => void;
  onExtendCourse: (userId: number, courseId: number, groupId?: number) => void;
  onIssueCertificate: (userId: number, courseId: number, groupId?: number) => void;
  onToggleAssignment: (userId: number, courseId: number, groupId?: number) => void;
}

export default function GroupTableRow({
  group,
  idx,
  organization,
  inn,
  members,
  isExpanded,
  isSelected,
  expandedMembers,
  onToggleGroup,
  onToggleSelect,
  onToggleMember,
  onOpenGroupStats,
  onOpenUserStats,
  onAddCourseForGroup,
  onAddCourseForMember,
  onActivateCourse,
  onExtendCourse,
  onIssueCertificate,
  onToggleAssignment,
}: GroupTableRowProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState(group.name);
  const [editOrg, setEditOrg] = useState(organization);
  const [editInn, setEditInn] = useState(inn);

  const activeAssignments = members.reduce(
    (sum, u) => sum + getMemberAssignments(u, group.id).filter((a) => a.active).length,
    0
  );
  const completedCount = members.filter((u) =>
    getMemberAssignments(u, group.id).some((a) => a.progress === 100)
  ).length;
  const avgGroupProgress = activeAssignments > 0
    ? Math.round(
        members.reduce(
          (s, u) => s + getMemberAssignments(u, group.id).filter((a) => a.active).reduce((ss, a) => ss + a.progress, 0),
          0
        ) / activeAssignments
      )
    : 0;
  const status = getGroupStatus(members, group.id);

  return (
    <>
      {editOpen && (
        <tr>
          <td colSpan={99} className="p-0">
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
              <div className="bg-background rounded-2xl border border-border w-full max-w-md shadow-2xl">
                <div className="flex items-center justify-between p-5 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
                      <Icon name="Users" size={16} className="text-white" />
                    </div>
                    <div>
                      <h2 className="font-bold text-sm">Редактировать группу</h2>
                      <p className="text-xs text-muted-foreground">{group.name}</p>
                    </div>
                  </div>
                  <button onClick={() => setEditOpen(false)} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
                    <Icon name="X" size={16} />
                  </button>
                </div>
                <div className="p-5 space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Название группы</label>
                    <input value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30" placeholder="ПБ-2024/01" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Организация</label>
                      <input value={editOrg} onChange={(e) => setEditOrg(e.target.value)} className="w-full h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30" placeholder='ООО «Название»' />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">ИНН</label>
                      <input value={editInn} onChange={(e) => setEditInn(e.target.value.replace(/\D/g, "").slice(0, 12))} className="w-full h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 font-mono" placeholder="7701234567" maxLength={12} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2.5 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl">
                    <Icon name="Info" size={14} className="text-amber-600 dark:text-amber-400 flex-shrink-0" />
                    <p className="text-xs text-amber-700 dark:text-amber-300">Состав участников и курсы изменяются в разделе управления слушателями</p>
                  </div>
                </div>
                <div className="flex gap-2 p-5 border-t border-border">
                  <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setEditOpen(false)}>Отмена</Button>
                  <Button className="flex-1 rounded-xl gradient-primary text-white" onClick={() => setEditOpen(false)} disabled={!editName.trim()}>
                    <Icon name="Check" size={15} className="mr-1.5" />
                    Сохранить
                  </Button>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
      <tr
        className={`border-b border-border transition-colors cursor-pointer hover:bg-muted/20 ${isExpanded ? "bg-violet-50/50 dark:bg-violet-900/10" : ""} ${isSelected ? "bg-violet-50/30 dark:bg-violet-900/10" : ""}`}
        onClick={() => onToggleGroup(group.name)}
      >
        <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(group.name)}
            className="rounded border-border cursor-pointer accent-violet-600"
          />
        </td>
        <td className="px-4 py-3">
          <Icon name={isExpanded ? "ChevronDown" : "ChevronRight"} size={16} className="text-muted-foreground" />
        </td>
        <td className="px-4 py-3 text-sm text-muted-foreground max-w-[180px]">
          <span className="block truncate" title={organization}>{organization || "—"}</span>
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2.5">
            <UserAvatar gradient={gradients[idx % gradients.length]} icon="UsersRound" />
            <span className="font-medium">{group.name}</span>
          </div>
        </td>
        <td className="px-4 py-3 text-muted-foreground">{members.length} чел.</td>
        <td className="px-4 py-3">
          <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${statusBadgeClass(status)}`}>{status}</span>
        </td>
        <td className="px-4 py-3 text-center">{activeAssignments}</td>
        <td className="px-4 py-3 text-center">{completedCount}</td>

        {/* Прогресс */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <ProgressBar value={avgGroupProgress} color="cyan" minWidth="min-w-[90px]" />
            <Tip text="Статистика группы" side="top">
              <button
                className="p-1 rounded-md hover:bg-cyan-100 dark:hover:bg-cyan-900/30 transition-colors text-muted-foreground hover:text-cyan-600 dark:hover:text-cyan-400 flex-shrink-0"
                onClick={(e) => { e.stopPropagation(); onOpenGroupStats(group.name); }}
              >
                <Icon name="BarChart2" size={13} />
              </button>
            </Tip>
          </div>
        </td>

        {/* Управление группой */}
        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-1">
            <Tip text="Редактировать группу">
              <button onClick={() => { setEditName(group.name); setEditOrg(organization); setEditInn(inn); setEditOpen(true); }} className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                <Icon name="Pencil" size={16} />
              </button>
            </Tip>
            <Tip text="Активна / Неактивна">
              <button className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-emerald-600">
                <Icon name="ToggleRight" size={16} />
              </button>
            </Tip>
            <Tip text="Назначить курс группе">
              <button
                className="p-2 rounded-lg hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors text-violet-600 dark:text-violet-400"
                disabled={members.length === 0}
                onClick={() => { onAddCourseForGroup(group.id); if (!isExpanded) onToggleGroup(group.name); }}
              >
                <Icon name="BookPlus" size={16} />
              </button>
            </Tip>
          </div>
        </td>
      </tr>

      {/* Раскрытая строка — участники группы */}
      {isExpanded && (
        <tr key={`${group.name}-expanded`} className="border-b border-border bg-violet-50/30 dark:bg-violet-900/5">
          <td colSpan={10} className="px-8 py-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Участники группы {group.name}
                </p>
                <div className="flex items-center gap-2">
                  <Tip text="Статистика группы">
                    <button
                      className="p-1 rounded-md hover:bg-cyan-100 dark:hover:bg-cyan-900/30 transition-colors text-muted-foreground hover:text-cyan-600 dark:hover:text-cyan-400 flex-shrink-0"
                      onClick={() => onOpenGroupStats(group.name)}
                    >
                      <Icon name="BarChart2" size={13} />
                    </button>
                  </Tip>
                  <Button
                    size="sm"
                    className="gradient-primary text-white rounded-xl gap-1.5 text-xs h-7"
                    onClick={() => onAddCourseForGroup(group.id)}
                  >
                    <Icon name="BookPlus" size={12} />
                    Назначить курс всей группе
                  </Button>
                </div>
              </div>

              {members.length === 0 ? (
                <p className="text-sm text-muted-foreground">Нет участников</p>
              ) : (
                <div className="rounded-xl border border-border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="px-4 py-2.5 w-8"></th>
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">ФИО</th>
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Логин / Пароль</th>
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground whitespace-nowrap">Курсов назначено</th>
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Завершено</th>
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Прогресс</th>
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {members.map((member, mi) => (
                        <GroupMemberRow
                          key={member.id}
                          member={member}
                          mi={mi}
                          groupId={group.id}
                          isExpanded={expandedMembers.has(member.id)}
                          onToggle={onToggleMember}
                          onOpenStats={onOpenUserStats}
                          onAddCourse={(userId) => onAddCourseForMember(userId, group.id)}
                          onActivateCourse={onActivateCourse}
                          onExtendCourse={onExtendCourse}
                          onIssueCertificate={onIssueCertificate}
                          onToggleAssignment={onToggleAssignment}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
