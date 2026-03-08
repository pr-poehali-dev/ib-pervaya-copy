import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import Tip from "@/components/ui/tip";
import GroupMemberRow from "./GroupMemberRow";
import { User, gradients } from "@/components/admin/types";

function getGroupStatus(members: User[]): string {
  if (members.length === 0) return "Не начато";
  const completed = members.filter((u) => u.assignments.some((a) => a.progress === 100));
  if (completed.length === members.length && members.length > 0) return "Завершено";
  if (members.some((u) => u.assignments.some((a) => a.active))) return "Обучается";
  return "Не начато";
}

function statusBadgeClass(status: string) {
  if (status === "Обучается") return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300";
  if (status === "Завершено") return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300";
  return "bg-muted text-muted-foreground";
}

interface GroupTableRowProps {
  group: string;
  idx: number;
  organization: string;
  members: User[];
  isExpanded: boolean;
  isSelected: boolean;
  expandedMembers: Set<number>;
  onToggleGroup: (group: string) => void;
  onToggleSelect: (group: string) => void;
  onToggleMember: (userId: number) => void;
  onOpenGroupStats: (group: string) => void;
  onOpenUserStats: (user: User) => void;
  onAddCourseForGroup: (group: string) => void;
  onAddCourseForMember: (userId: number) => void;
  onActivateCourse: (userId: number, courseId: number, date: string) => void;
  onExtendCourse: (userId: number, courseId: number) => void;
  onIssueCertificate: (userId: number, courseId: number) => void;
  onToggleAssignment: (userId: number, courseId: number) => void;
}

export default function GroupTableRow({
  group,
  idx,
  organization,
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
  const activeAssignments = members.reduce((sum, u) => sum + u.assignments.filter((a) => a.active).length, 0);
  const completedCount = members.filter((u) => u.assignments.some((a) => a.progress === 100)).length;
  const avgGroupProgress = activeAssignments > 0
    ? Math.round(members.reduce((s, u) => s + u.assignments.filter((a) => a.active).reduce((ss, a) => ss + a.progress, 0), 0) / activeAssignments)
    : 0;
  const status = getGroupStatus(members);

  return (
    <>
      <tr
        className={`border-b border-border transition-colors cursor-pointer hover:bg-muted/20 ${isExpanded ? "bg-violet-50/50 dark:bg-violet-900/10" : ""} ${isSelected ? "bg-violet-50/30 dark:bg-violet-900/10" : ""}`}
        onClick={() => onToggleGroup(group)}
      >
        <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(group)}
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
            <div className={`w-8 h-8 bg-gradient-to-br ${gradients[idx % gradients.length]} rounded-lg flex items-center justify-center flex-shrink-0`}>
              <Icon name="UsersRound" size={14} className="text-white" />
            </div>
            <span className="font-medium">{group}</span>
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
          {activeAssignments > 0 ? (
            <div className="flex items-center gap-2 min-w-[90px]">
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full transition-all"
                  style={{ width: `${avgGroupProgress}%` }}
                />
              </div>
              <span className="text-xs font-semibold w-9 text-right">{avgGroupProgress}%</span>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          )}
        </td>

        {/* Управление группой */}
        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-1">
            <Tip text="Статистика группы">
              <button
                className="p-2 rounded-lg hover:bg-cyan-100 dark:hover:bg-cyan-900/30 transition-colors text-cyan-600 dark:text-cyan-400"
                onClick={() => onOpenGroupStats(group)}
              >
                <Icon name="BarChart2" size={16} />
              </button>
            </Tip>
            <Tip text="Редактировать группу">
              <button className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
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
                onClick={() => { onAddCourseForGroup(group); if (!isExpanded) onToggleGroup(group); }}
              >
                <Icon name="BookPlus" size={16} />
              </button>
            </Tip>
          </div>
        </td>
      </tr>

      {/* Раскрытая строка — участники группы */}
      {isExpanded && (
        <tr key={`${group}-expanded`} className="border-b border-border bg-violet-50/30 dark:bg-violet-900/5">
          <td colSpan={10} className="px-8 py-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Участники группы {group}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-xl gap-1.5 text-xs h-7 border-cyan-200 dark:border-cyan-800 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20"
                    onClick={() => onOpenGroupStats(group)}
                  >
                    <Icon name="BarChart2" size={12} />
                    Статистика группы
                  </Button>
                  <Button
                    size="sm"
                    className="gradient-primary text-white rounded-xl gap-1.5 text-xs h-7"
                    onClick={() => onAddCourseForGroup(group)}
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
                          isExpanded={expandedMembers.has(member.id)}
                          onToggle={onToggleMember}
                          onOpenStats={onOpenUserStats}
                          onAddCourse={onAddCourseForMember}
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