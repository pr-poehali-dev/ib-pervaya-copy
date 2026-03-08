import { useState, useEffect } from "react";
import { useStats } from "@/contexts/StatsContext";
import { useRole } from "@/contexts/RoleContext";
import { useAdminData } from "@/hooks/useAdminData";
import Layout from "@/components/layout/Layout";
import AdminHeader from "@/components/admin/AdminHeader";
import AddUserDialog from "@/components/admin/AddUserDialog";
import AdminTabBar, { AdminTabKey } from "@/components/admin/AdminTabBar";
import AdminTabContent from "@/components/admin/AdminTabContent";

export default function Admin() {
  const {
    users,
    groups,
    search,
    setSearch,
    filteredUsers,
    totalAssignments,
    totalCompleted,
    loading,
    error,
    addUser,
    toggleCourse,
  } = useAdminData();

  const { role } = useRole();
  const isManager = role === "manager";
  const showCatalog = role === "admin" || role === "manager";
  const [activeTab, setActiveTab] = useState<AdminTabKey>("stp");

  // ─── Диалог добавления группы ─────────────────────────────────────────────
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupOrgName, setNewGroupOrgName] = useState("");
  const [newGroupInn, setNewGroupInn] = useState("");
  const [newGroupFile, setNewGroupFile] = useState<File | null>(null);
  const [newGroupError, setNewGroupError] = useState("");

  // ─── Диалог добавления слушателя ─────────────────────────────────────────
  const [showAddUser, setShowAddUser] = useState(false);
  const [newLastName, setNewLastName] = useState("");
  const [newFirstName, setNewFirstName] = useState("");
  const [newMiddleName, setNewMiddleName] = useState("");
  const [newOrg, setNewOrg] = useState("");
  const [newInn, setNewInn] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newGroup, setNewGroup] = useState(groups[0] ?? "");
  const [newRole, setNewRole] = useState("Студент");
  const [selectedCourses, setSelectedCourses] = useState<number[]>([]);
  const [showCoursesPicker, setShowCoursesPicker] = useState(false);
  const [openDirections, setOpenDirections] = useState<number[]>([1]);
  const [showGroupDropdown, setShowGroupDropdown] = useState(false);
  const [selectedListenerGroup, setSelectedListenerGroup] = useState("");
  const [newGroupForListener, setNewGroupForListener] = useState("");
  const [availableGroups, setAvailableGroups] = useState<string[]>([...groups]);
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");

  const toggleDirection = (id: number) =>
    setOpenDirections((p) => (p.includes(id) ? p.filter((d) => d !== id) : [...p, id]));

  // ─── STP фильтры ─────────────────────────────────────────────────────────
  const [stpFilterStatus, setStpFilterStatus] = useState("Все");
  const [stpFilterOrgs, setStpFilterOrgs] = useState<string[]>([]);
  const [stpFilterFio, setStpFilterFio] = useState<string[]>([]);
  const [stpFilterCourse, setStpFilterCourse] = useState("");

  // ─── Обработчик добавления слушателя ────────────────────────────────────
  const handleAddUser = () => {
    let valid = true;
    if (!newLastName.trim()) { setNameError("Введите фамилию"); valid = false; } else setNameError("");
    if (!newEmail.trim()) { setEmailError("Введите email"); valid = false; }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) { setEmailError("Некорректный email"); valid = false; }
    else setEmailError("");
    if (!valid) return;

    addUser({
      lastName: newLastName,
      firstName: newFirstName,
      middleName: newMiddleName,
      email: newEmail,
      group: newGroup,
      role: newRole,
      courseIds: selectedCourses,
    });

    setShowAddUser(false);
    setNewLastName(""); setNewFirstName(""); setNewMiddleName("");
    setNewOrg(""); setNewEmail(""); setNewInn("");
    setNewGroup(groups[0] ?? ""); setNewRole("Студент");
    setSelectedCourses([]); setSelectedListenerGroup(""); setShowGroupDropdown(false);
  };

  // ─── Синхронизация со StatsContext ───────────────────────────────────────
  const { setStats } = useStats();
  useEffect(() => {
    setStats({ users: users.length, courses: 6, assignments: totalAssignments, completed: totalCompleted });
  }, [users.length, totalAssignments, totalCompleted]);

  if (error) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto flex flex-col items-center justify-center min-h-[40vh] gap-4 text-center">
          <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center">
            <span className="text-2xl">⚠️</span>
          </div>
          <div>
            <p className="font-bold text-base">Не удалось загрузить данные</p>
            <p className="text-muted-foreground text-sm mt-1">{error}</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto space-y-6 animate-pulse">
          <div className="h-20 bg-muted rounded-2xl" />
          <div className="flex gap-2">
            {[1,2,3,4,5].map(i => <div key={i} className="h-10 flex-1 bg-muted rounded-xl" />)}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1,2,3].map(i => <div key={i} className="h-40 bg-muted rounded-2xl" />)}
          </div>
          <div className="h-64 bg-muted rounded-2xl" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        <AdminHeader
          showAddGroup={showAddGroup}
          setShowAddGroup={setShowAddGroup}
          newGroupName={newGroupName}
          setNewGroupName={setNewGroupName}
          newGroupOrgName={newGroupOrgName}
          setNewGroupOrgName={setNewGroupOrgName}
          newGroupInn={newGroupInn}
          setNewGroupInn={setNewGroupInn}
          newGroupFile={newGroupFile}
          setNewGroupFile={setNewGroupFile}
          newGroupError={newGroupError}
          setNewGroupError={setNewGroupError}
          onAddUserClick={() => setShowAddUser(true)}
        />

        <AddUserDialog
          show={showAddUser}
          onClose={() => setShowAddUser(false)}
          newLastName={newLastName} setNewLastName={setNewLastName}
          newFirstName={newFirstName} setNewFirstName={setNewFirstName}
          newMiddleName={newMiddleName} setNewMiddleName={setNewMiddleName}
          newOrg={newOrg} setNewOrg={setNewOrg}
          newInn={newInn} setNewInn={setNewInn}
          newEmail={newEmail} setNewEmail={setNewEmail}
          nameError={nameError} setNameError={setNameError}
          emailError={emailError} setEmailError={setEmailError}
          selectedCourses={selectedCourses} setSelectedCourses={setSelectedCourses}
          showCoursesPicker={showCoursesPicker} setShowCoursesPicker={setShowCoursesPicker}
          openDirections={openDirections} toggleDirection={toggleDirection}
          showGroupDropdown={showGroupDropdown} setShowGroupDropdown={setShowGroupDropdown}
          selectedListenerGroup={selectedListenerGroup} setSelectedListenerGroup={setSelectedListenerGroup}
          newGroupForListener={newGroupForListener} setNewGroupForListener={setNewGroupForListener}
          availableGroups={availableGroups} setAvailableGroups={setAvailableGroups}
          setNewGroup={setNewGroup}
          onSave={handleAddUser}
        />

        <AdminTabBar activeTab={activeTab} setActiveTab={setActiveTab} hideSettings={isManager} showCatalog={showCatalog} />

        <AdminTabContent
          activeTab={activeTab}
          users={users}
          filteredUsers={filteredUsers}
          toggleCourse={toggleCourse}
          stpFilterStatus={stpFilterStatus} setStpFilterStatus={setStpFilterStatus}
          stpFilterOrgs={stpFilterOrgs} setStpFilterOrgs={setStpFilterOrgs}
          stpFilterFio={stpFilterFio} setStpFilterFio={setStpFilterFio}
          stpFilterCourse={stpFilterCourse} setStpFilterCourse={setStpFilterCourse}
        />
      </div>
    </Layout>
  );
}