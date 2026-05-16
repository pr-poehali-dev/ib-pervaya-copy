import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import GroupCard from "./GroupCard";
import MemberCard from "./MemberCard";
import MemberCoursesView from "./MemberCoursesView";
import { User, Group } from "@/components/admin/types";

type NavLevel = "groups" | "members" | "member";

interface GroupsCardsViewProps {
  navLevel: NavLevel;
  filteredGroups: Group[];
  totalGroups: number;
  localUsers: User[];
  activeGroup: Group | null;
  activeMember: User | null;
  activeGroupMembers: User[];
  getGroupStatus: (members: User[], groupId: number) => string;
  getAvgProgress: (members: User[], groupId: number) => number;
  onOpenGroup: (group: Group) => void;
  onOpenMember: (member: User) => void;
  onSetGroupStatsFor: (groupName: string) => void;
  onSetAddCourseForGroup: (groupId: number) => void;
  onSetAddCourseForMember: (userId: number, groupId: number) => void;
  onSetStatsUser: (user: User) => void;
  onActivateAll: (groupId: number, members: User[]) => void;
  onAddCourse: (userId: number, courseIds: number[], groupId: number) => void;
  onActivateCourse: (userId: number, courseId: number, date?: string, groupId?: number) => void;
  onExtendCourse: (userId: number, courseId: number, groupId?: number) => void;
  onIssueCertificate: (userId: number, courseId: number, groupId?: number) => void;
  onToggleAssignment: (userId: number, courseId: number, groupId?: number) => void;
}

export default function GroupsCardsView({
  navLevel,
  filteredGroups,
  totalGroups,
  localUsers,
  activeGroup,
  activeMember,
  activeGroupMembers,
  getGroupStatus,
  getAvgProgress,
  onOpenGroup,
  onOpenMember,
  onSetGroupStatsFor,
  onSetAddCourseForGroup,
  onSetAddCourseForMember,
  onSetStatsUser,
  onActivateAll,
  onActivateCourse,
  onExtendCourse,
  onIssueCertificate,
  onToggleAssignment,
}: GroupsCardsViewProps) {
  return (
    <>
      {/* Уровень групп */}
      {navLevel === "groups" && (
        <>
          <p className="text-xs text-muted-foreground">Показано <span className="font-medium text-foreground">{filteredGroups.length}</span> из <span className="font-medium text-foreground">{totalGroups}</span> групп</p>
          {filteredGroups.length === 0 ? (
            <div className="p-10 text-center bg-card rounded-2xl border border-border">
              <Icon name="SearchX" size={32} className="text-muted-foreground mx-auto mb-3" />
              <p className="font-medium">Группы не найдены</p>
              <p className="text-muted-foreground text-sm mt-1">Попробуйте изменить условия фильтрации</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredGroups.map((group) => {
                const members = localUsers.filter((u) => u.enrollments.some((e) => e.groupId === group.id));
                const status = getGroupStatus(members, group.id);
                const avgProgress = getAvgProgress(members, group.id);
                return (
                  <GroupCard
                    key={group.id}
                    group={group.name}
                    groupId={group.id}
                    members={members}
                    status={status}
                    avgProgress={avgProgress}
                    onOpen={() => onOpenGroup(group)}
                    onStats={() => onSetGroupStatsFor(group.name)}
                    onAddCourse={() => onSetAddCourseForGroup(group.id)}
                    onActivateAll={() => onActivateAll(group.id, members)}
                  />
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Уровень слушателей */}
      {navLevel === "members" && activeGroup && (
        <>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl gap-2"
              onClick={() => onSetGroupStatsFor(activeGroup.name)}
            >
              <Icon name="BarChart2" size={15} />
              Статистика группы
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl gap-2"
              onClick={() => onSetAddCourseForGroup(activeGroup.id)}
            >
              <Icon name="BookPlus" size={15} />
              Назначить курс всей группе
            </Button>
            <p className="text-xs text-muted-foreground ml-auto">
              {activeGroupMembers.length} слушател{activeGroupMembers.length === 1 ? "ь" : activeGroupMembers.length < 5 ? "я" : "ей"}
            </p>
          </div>

          {activeGroupMembers.length === 0 ? (
            <div className="p-10 text-center bg-card rounded-2xl border border-border">
              <Icon name="Users" size={32} className="text-muted-foreground mx-auto mb-3" />
              <p className="font-medium">В группе нет слушателей</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {activeGroupMembers.map((member) => (
                <MemberCard
                  key={member.id}
                  user={member}
                  groupId={activeGroup.id}
                  onOpen={() => onOpenMember(member)}
                  onStats={() => onSetStatsUser(member)}
                  onAddCourse={() => onSetAddCourseForMember(member.id, activeGroup.id)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Уровень слушателя (курсы) */}
      {navLevel === "member" && activeMember && activeGroup && (
        <MemberCoursesView
          member={localUsers.find((u) => u.id === activeMember.id) ?? activeMember}
          memberIndex={activeGroupMembers.findIndex((u) => u.id === activeMember.id)}
          groupId={activeGroup.id}
          onAddCourse={(userId) => onSetAddCourseForMember(userId, activeGroup.id)}
          onActivateCourse={onActivateCourse}
          onExtendCourse={onExtendCourse}
          onIssueCertificate={onIssueCertificate}
          onToggleAssignment={onToggleAssignment}
        />
      )}
    </>
  );
}