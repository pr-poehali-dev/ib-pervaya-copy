import Icon from "@/components/ui/icon";
import GroupTableRow from "./GroupTableRow";
import { User } from "@/components/admin/types";
import { GROUPS_DATA } from "@/data/mockData";

interface GroupsTableViewProps {
  filteredGroups: string[];
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
  onOpenGroupStats: (group: string) => void;
  onOpenUserStats: (u: User) => void;
  onAddCourseForGroup: (group: string) => void;
  onAddCourseForMember: (userId: number) => void;
  onActivateCourse: (userId: number, courseId: number, date?: string) => void;
  onExtendCourse: (userId: number, courseId: number) => void;
  onIssueCertificate: (userId: number, courseId: number) => void;
  onToggleAssignment: (userId: number, courseId: number) => void;
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
                const members = localUsers.filter((u) => u.group === group);
                const organization = members[0]?.organization ?? "";
                const groupData = GROUPS_DATA.find((g) => g.name === group);
                const inn = groupData?.inn ?? "";
                return (
                  <GroupTableRow
                    key={group}
                    group={group}
                    idx={idx}
                    organization={organization}
                    inn={inn}
                    members={members}
                    isExpanded={expandedGroups.has(group)}
                    isSelected={selectedGroups.has(group)}
                    expandedMembers={expandedMembers}
                    onToggleGroup={onToggleGroup}
                    onToggleSelect={onToggleSelect}
                    onToggleMember={onToggleMember}
                    onOpenGroupStats={(g) => onOpenGroupStats(g)}
                    onOpenUserStats={(u) => onOpenUserStats(localUsers.find((lu) => lu.id === u.id) ?? u)}
                    onAddCourseForGroup={(g) => onAddCourseForGroup(g)}
                    onAddCourseForMember={(userId) => onAddCourseForMember(userId)}
                    onActivateCourse={onActivateCourse}
                    onExtendCourse={onExtendCourse}
                    onIssueCertificate={onIssueCertificate}
                    onToggleAssignment={onToggleAssignment}
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