import Icon from "@/components/ui/icon";
import GroupTableRow from "./GroupTableRow";
import { User, Group } from "@/components/admin/types";

interface GroupsTableViewProps {
  filteredGroups: Group[];
  totalGroups: number;
  localUsers: User[];
  expandedGroups: Set<string>;
  expandedMembers: Set<number>;
  selectedGroups: Set<string>;
  allChecked: boolean;
  someChecked: boolean;
  onToggleSelectAll: () => void;
  onToggleGroup: (group: string) => void;
  onToggleSelect: (group: string) => void;
  onToggleMember: (userId: number) => void;
  onOpenGroupStats: (groupName: string) => void;
  onOpenUserStats: (u: User) => void;
  onAddCourseForGroup: (groupId: number) => void;
  onAddCourseForMember: (userId: number, groupId: number) => void;
  onActivateCourse: (userId: number, courseId: number, date?: string, groupId?: number) => void;
  onExtendCourse: (userId: number, courseId: number, groupId?: number) => void;
  onIssueCertificate: (userId: number, courseId: number, groupId?: number) => void;
  onToggleAssignment: (userId: number, courseId: number, groupId?: number) => void;
  onEnrollToGroup: (user: User) => void;
}

export default function GroupsTableView({
  filteredGroups,
  totalGroups,
  localUsers,
  expandedGroups,
  expandedMembers,
  selectedGroups,
  allChecked,
  someChecked,
  onToggleSelectAll,
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
  onEnrollToGroup,
}: GroupsTableViewProps) {
  return (
    <>
      <p className="text-xs text-muted-foreground">
        Показано <span className="font-medium text-foreground">{filteredGroups.length}</span> из <span className="font-medium text-foreground">{totalGroups}</span> групп
        {selectedGroups.size > 0 && <span className="ml-2 text-primary font-medium">· Выбрано: {selectedGroups.size}</span>}
      </p>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-3 py-3 w-8" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={allChecked}
                    ref={(el) => { if (el) el.indeterminate = someChecked && !allChecked; }}
                    onChange={onToggleSelectAll}
                    className="rounded border-border cursor-pointer accent-primary"
                  />
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground w-8"></th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">Организация</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Группа</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">Участников</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Статус</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">Назначений</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">Завершили</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">Прогресс</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">Управление</th>
              </tr>
            </thead>
            <tbody>
              {filteredGroups.map((group, idx) => {
                const members = localUsers.filter((u) => u.enrollments.some((e) => e.groupId === group.id));
                return (
                  <GroupTableRow
                    key={group.id}
                    group={group}
                    idx={idx}
                    organization={group.clientOrganizationName ?? members[0]?.organization ?? ""}
                    inn={group.inn ?? ""}
                    members={members}
                    isExpanded={expandedGroups.has(group.name)}
                    isSelected={selectedGroups.has(group.name)}
                    expandedMembers={expandedMembers}
                    onToggleGroup={onToggleGroup}
                    onToggleSelect={onToggleSelect}
                    onToggleMember={onToggleMember}
                    onOpenGroupStats={(name) => onOpenGroupStats(name)}
                    onOpenUserStats={(u) => onOpenUserStats(localUsers.find((lu) => lu.id === u.id) ?? u)}
                    onAddCourseForGroup={(groupId) => onAddCourseForGroup(groupId)}
                    onAddCourseForMember={(userId, groupId) => onAddCourseForMember(userId, groupId)}
                    onActivateCourse={onActivateCourse}
                    onExtendCourse={onExtendCourse}
                    onIssueCertificate={onIssueCertificate}
                    onToggleAssignment={onToggleAssignment}
                    onEnrollToGroup={onEnrollToGroup}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredGroups.length === 0 && (
          <div className="p-10 text-center">
            <Icon name="SearchX" size={32} className="text-muted-foreground mx-auto mb-3" />
            <p className="font-medium">Группы не найдены</p>
            <p className="text-muted-foreground text-sm mt-1">Попробуйте изменить условия фильтрации</p>
          </div>
        )}
      </div>
    </>
  );
}