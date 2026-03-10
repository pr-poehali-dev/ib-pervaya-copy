import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import GroupCard from "./GroupCard";
import MemberCard from "./MemberCard";
import MemberCoursesView from "./MemberCoursesView";
import { User } from "@/components/admin/types";

type NavLevel = "groups" | "members" | "member";

interface GroupsCardsViewProps {
  navLevel: NavLevel;
  filteredGroups: string[];
  localUsers: User[];
  activeGroup: string | null;
  activeMember: User | null;
  activeGroupMembers: User[];
  getGroupStatus: (members: User[]) => string;
  getAvgProgress: (members: User[]) => number;
  onOpenGroup: (group: string) => void;
  onOpenMember: (member: User) => void;
  onSetGroupStatsFor: (group: string) => void;
  onSetAddCourseForGroup: (group: string) => void;
  onSetAddCourseForMember: (userId: number) => void;
  onSetStatsUser: (user: User) => void;
  onActivateAll: (group: string, members: User[]) => void;
  onAddCourse: (userId: number, courseIds: number[]) => void;
  onActivateCourse: (userId: number, courseId: number, date?: string) => void;
  onExtendCourse: (userId: number, courseId: number) => void;
  onIssueCertificate: (userId: number, courseId: number) => void;
  onToggleAssignment: (userId: number, courseId: number) => void;
}

export default function GroupsCardsView({
  navLevel,
  filteredGroups,
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
          <p className="text-xs text-muted-foreground">Найдено групп: {filteredGroups.length}</p>
          {filteredGroups.length === 0 ? (
            <div className="p-10 text-center bg-card rounded-2xl border border-border">
              <Icon name="SearchX" size={32} className="text-muted-foreground mx-auto mb-3" />
              <p className="font-medium">Группы не найдены</p>
              <p className="text-muted-foreground text-sm mt-1">Попробуйте изменить условия фильтрации</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredGroups.map((group) => {
                const members = localUsers.filter((u) => u.group === group);
                const status = getGroupStatus(members);
                const avgProgress = getAvgProgress(members);
                return (
                  <GroupCard
                    key={group}
                    group={group}
                    members={members}
                    status={status}
                    avgProgress={avgProgress}
                    onOpen={() => onOpenGroup(group)}
                    onStats={() => onSetGroupStatsFor(group)}
                    onAddCourse={() => onSetAddCourseForGroup(group)}
                    onActivateAll={() => onActivateAll(group, members)}
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
              onClick={() => onSetGroupStatsFor(activeGroup)}
            >
              <Icon name="BarChart2" size={15} />
              Статистика группы
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl gap-2"
              onClick={() => onSetAddCourseForGroup(activeGroup)}
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
                  onOpen={() => onOpenMember(member)}
                  onStats={() => onSetStatsUser(member)}
                  onAddCourse={() => onSetAddCourseForMember(member.id)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Уровень слушателя (курсы) */}
      {navLevel === "member" && activeMember && (
        <MemberCoursesView
          member={localUsers.find((u) => u.id === activeMember.id) ?? activeMember}
          memberIndex={activeGroupMembers.findIndex((u) => u.id === activeMember.id)}
          onAddCourse={(userId) => onSetAddCourseForMember(userId)}
          onActivateCourse={onActivateCourse}
          onExtendCourse={onExtendCourse}
          onIssueCertificate={onIssueCertificate}
          onToggleAssignment={onToggleAssignment}
        />
      )}
    </>
  );
}
