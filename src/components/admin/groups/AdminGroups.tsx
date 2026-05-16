import { useMemo, useState } from "react";
import Icon from "@/components/ui/icon";
import UserStatsModal from "@/components/admin/users/UserStatsModal";
import GroupStatsModal from "./GroupStatsModal";
import GroupAddCourseModal from "./GroupAddCourseModal";
import GroupsBreadcrumbs from "./GroupsBreadcrumbs";
import GroupsFiltersPanel from "./GroupsFiltersPanel";
import GroupsTableView from "./GroupsTableView";
import GroupsCardsView from "./GroupsCardsView";
import { User, Group, allCourses } from "@/components/admin/types";
import { GROUPS_DATA } from "@/data/mockData";
import { useRole } from "@/contexts/RoleContext";
import { getGroupStatus, getAvgProgress } from "./groupsUtils";
import { useGroupsData } from "./useGroupsData";
import { useGroupsSelection } from "./useGroupsSelection";

interface AdminGroupsProps {
  users: User[];
}

type ViewMode = "table" | "cards";
type NavLevel = "groups" | "members" | "member";

export default function AdminGroups({ users }: AdminGroupsProps) {
  const { tenantType } = useRole();
  const canIssueCert = tenantType === "training_center";

  // ─── Вид и навигация ────────────────────────────────────────────────────────
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [navLevel, setNavLevel] = useState<NavLevel>("groups");
  const [activeGroup, setActiveGroup] = useState<Group | null>(null);
  const [activeMember, setActiveMember] = useState<User | null>(null);

  // ─── Фильтры ─────────────────────────────────────────────────────────────────
  const [filterStatus, setFilterStatus] = useState("Все");
  const [filterOrgs, setFilterOrgs] = useState<string[]>([]);
  const [filterGroups, setFilterGroups] = useState<string[]>([]);
  const [filterFio, setFilterFio] = useState<string[]>([]);
  const [filterCourse, setFilterCourse] = useState("");

  // ─── Модалки ─────────────────────────────────────────────────────────────────
  const [addCourseForGroup, setAddCourseForGroup] = useState<number | null>(null);
  const [addCourseForMember, setAddCourseForMember] = useState<{ userId: number; groupId: number } | null>(null);
  const [statsUser, setStatsUser] = useState<User | null>(null);
  const [groupStatsFor, setGroupStatsFor] = useState<string | null>(null);

  // ─── Хуки ────────────────────────────────────────────────────────────────────
  const {
    localUsers,
    addCoursesToMember,
    addCoursesToGroup,
    activateCourse,
    extendCourse,
    issueCertificate,
    toggleAssignment,
    handleActivateAll,
  } = useGroupsData(users);

  const filteredGroups = useMemo((): Group[] => {
    return GROUPS_DATA.filter((g) => {
      const members = localUsers.filter((u) => u.enrollments.some((e) => e.groupId === g.id));
      const status = getGroupStatus(members, g.id);
      if (filterStatus !== "Все" && status !== filterStatus) return false;
      if (filterOrgs.length > 0 && !members.some((u) => filterOrgs.includes(u.organization))) return false;
      if (filterGroups.length > 0 && !filterGroups.includes(g.name)) return false;
      if (filterFio.length > 0 && !members.some((u) => filterFio.includes(u.name))) return false;
      if (filterCourse) {
        const course = allCourses.find((c) => c.title === filterCourse);
        if (course && !members.some((u) =>
          u.enrollments.some((e) => e.groupId === g.id && e.assignments.some((a) => a.courseId === course.id && a.active))
        )) return false;
      }
      return true;
    });
  }, [localUsers, filterStatus, filterOrgs, filterGroups, filterFio, filterCourse]);

  const {
    expandedGroups,
    expandedMembers,
    selectedGroups,
    actionsOpen,
    setActionsOpen,
    actionsPos,
    actionsButtonRef,
    actionsMenuRef,
    allChecked,
    someChecked,
    toggleSelectAll,
    toggleSelectOne,
    toggleGroup,
    toggleMember,
  } = useGroupsSelection(filteredGroups);

  // ─── Вспомогательные данные ───────────────────────────────────────────────────
  const orgOptions = useMemo(() => [...new Set(localUsers.map((u) => u.organization).filter(Boolean))], [localUsers]);
  const groupOptions = useMemo(() => GROUPS_DATA.map((g) => g.name), []);
  const fioOptions = useMemo(() => localUsers.map((u) => u.name), [localUsers]);
  const courseOptions = useMemo(() => allCourses.map((c) => c.title), []);

  const resetFilters = () => {
    setFilterStatus("Все");
    setFilterOrgs([]);
    setFilterGroups([]);
    setFilterFio([]);
    setFilterCourse("");
  };

  function openGroup(group: Group) {
    setActiveGroup(group);
    setNavLevel("members");
  }

  function openMember(member: User) {
    setActiveMember(member);
    setNavLevel("member");
  }

  const addCourseMemberUser = addCourseForMember !== null
    ? localUsers.find((u) => u.id === addCourseForMember.userId)
    : null;

  // Собираем alreadyAssigned из всех enrollment'ов пользователя
  const addCourseMemberAlreadyAssigned = addCourseMemberUser
    ? addCourseMemberUser.enrollments.flatMap((e) => e.assignments.map((a) => a.courseId))
    : [];

  const activeGroupMembers = activeGroup
    ? localUsers.filter((u) => u.enrollments.some((e) => e.groupId === activeGroup.id))
    : [];

  return (
    <div className="space-y-4">
      {/* Модалки */}
      {addCourseForGroup !== null && (
        <GroupAddCourseModal
          title={`Назначить курс группе ${GROUPS_DATA.find((g) => g.id === addCourseForGroup)?.name ?? ""}`}
          onClose={() => setAddCourseForGroup(null)}
          onAdd={(ids) => addCoursesToGroup(addCourseForGroup, ids)}
        />
      )}
      {addCourseForMember !== null && addCourseMemberUser && (
        <GroupAddCourseModal
          title={`Добавить курс — ${addCourseMemberUser.name}`}
          onClose={() => setAddCourseForMember(null)}
          onAdd={(ids) => addCoursesToMember(addCourseForMember.userId, ids, addCourseForMember.groupId)}
          alreadyAssigned={addCourseMemberAlreadyAssigned}
        />
      )}
      <UserStatsModal user={statsUser} onClose={() => setStatsUser(null)} />
      <GroupStatsModal
        groupName={groupStatsFor}
        users={localUsers}
        onClose={() => setGroupStatsFor(null)}
        onUserStats={(u) => { setGroupStatsFor(null); setStatsUser(u); }}
      />

      {!canIssueCert && (
        <div className="flex items-start gap-3 px-4 py-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-2xl">
          <Icon name="Info" size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-700 dark:text-amber-400">
            Выдача удостоверений недоступна — ваш тенант зарегистрирован как <strong>Организация</strong>. Эта функция доступна только <strong>Учебным центрам</strong>.
          </p>
        </div>
      )}

      {/* Хлебные крошки (только в режиме карточек) */}
      {viewMode === "cards" && (
        <GroupsBreadcrumbs
          navLevel={navLevel}
          activeGroup={activeGroup?.name ?? null}
          activeMember={activeMember}
          activeGroupMembers={activeGroupMembers}
          onGoGroups={() => { setNavLevel("groups"); setActiveGroup(null); setActiveMember(null); }}
          onGoMembers={() => { setNavLevel("members"); setActiveMember(null); }}
        />
      )}

      {/* Панель фильтров (только на уровне групп) */}
      {(viewMode === "table" || navLevel === "groups") && (
        <GroupsFiltersPanel
          viewMode={viewMode}
          setViewMode={setViewMode}
          onSwitchToCards={() => { setViewMode("cards"); setNavLevel("groups"); setActiveGroup(null); }}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          filterOrgs={filterOrgs}
          setFilterOrgs={setFilterOrgs}
          filterGroups={filterGroups}
          setFilterGroups={setFilterGroups}
          filterFio={filterFio}
          setFilterFio={setFilterFio}
          filterCourse={filterCourse}
          setFilterCourse={setFilterCourse}
          orgOptions={orgOptions}
          groupOptions={groupOptions}
          fioOptions={fioOptions}
          courseOptions={courseOptions}
          onResetFilters={resetFilters}
          selectedGroupsSize={selectedGroups.size}
          actionsOpen={actionsOpen}
          setActionsOpen={setActionsOpen}
          actionsButtonRef={actionsButtonRef}
          actionsMenuRef={actionsMenuRef}
          actionsPos={actionsPos}
          selectedGroups={selectedGroups}
          allUsers={localUsers}
        />
      )}

      {/* Режим: таблица */}
      {viewMode === "table" && (
        <GroupsTableView
          filteredGroups={filteredGroups}
          totalGroups={GROUPS_DATA.length}
          localUsers={localUsers}
          expandedGroups={expandedGroups}
          expandedMembers={expandedMembers}
          selectedGroups={selectedGroups}
          allChecked={allChecked}
          someChecked={someChecked}
          onToggleSelectAll={toggleSelectAll}
          onToggleGroup={toggleGroup}
          onToggleSelect={toggleSelectOne}
          onToggleMember={toggleMember}
          onOpenGroupStats={(groupName) => setGroupStatsFor(groupName)}
          onOpenUserStats={(u) => setStatsUser(localUsers.find((lu) => lu.id === u.id) ?? u)}
          onAddCourseForGroup={(groupId) => setAddCourseForGroup(groupId)}
          onAddCourseForMember={(userId, groupId) => setAddCourseForMember({ userId, groupId })}
          onActivateCourse={activateCourse}
          onExtendCourse={extendCourse}
          onIssueCertificate={issueCertificate}
          onToggleAssignment={toggleAssignment}
        />
      )}

      {/* Режим: карточки */}
      {viewMode === "cards" && (
        <GroupsCardsView
          navLevel={navLevel}
          filteredGroups={filteredGroups}
          totalGroups={GROUPS_DATA.length}
          localUsers={localUsers}
          activeGroup={activeGroup}
          activeMember={activeMember}
          activeGroupMembers={activeGroupMembers}
          getGroupStatus={getGroupStatus}
          getAvgProgress={getAvgProgress}
          onOpenGroup={openGroup}
          onOpenMember={openMember}
          onSetGroupStatsFor={(g) => setGroupStatsFor(g)}
          onSetAddCourseForGroup={(groupId) => setAddCourseForGroup(groupId)}
          onSetAddCourseForMember={(userId, groupId) => setAddCourseForMember({ userId, groupId })}
          onSetStatsUser={(u) => setStatsUser(u)}
          onActivateAll={handleActivateAll}
          onAddCourse={addCoursesToMember}
          onActivateCourse={activateCourse}
          onExtendCourse={extendCourse}
          onIssueCertificate={issueCertificate}
          onToggleAssignment={toggleAssignment}
        />
      )}
    </div>
  );
}
