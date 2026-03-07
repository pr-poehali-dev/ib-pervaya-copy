import { useState, useEffect } from "react";
import { useStats } from "@/contexts/StatsContext";
import Layout from "@/components/layout/Layout";
import { User, initialUsers, groups, getInitials } from "@/components/admin/types";
import AdminHeader from "@/components/admin/AdminHeader";
import AddUserDialog from "@/components/admin/AddUserDialog";
import AdminTabBar from "@/components/admin/AdminTabBar";
import AdminTabContent from "@/components/admin/AdminTabContent";

type ActiveTab = "stp" | "groups" | "users" | "courses" | "reports" | "settings";

export default function Admin() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("stp");

  // Добавление группы
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupOrgName, setNewGroupOrgName] = useState("");
  const [newGroupInn, setNewGroupInn] = useState("");
  const [newGroupFile, setNewGroupFile] = useState<File | null>(null);
  const [newGroupError, setNewGroupError] = useState("");

  // Добавление слушателя
  const [showAddUser, setShowAddUser] = useState(false);
  const [newLastName, setNewLastName] = useState("");
  const [newFirstName, setNewFirstName] = useState("");
  const [newMiddleName, setNewMiddleName] = useState("");
  const [newOrg, setNewOrg] = useState("");
  const [newInn, setNewInn] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newGroup, setNewGroup] = useState("ИБ-301");
  const [newRole, setNewRole] = useState("Студент");
  const [selectedCourses, setSelectedCourses] = useState<number[]>([]);
  const [showCoursesPicker, setShowCoursesPicker] = useState(false);
  const [openDirections, setOpenDirections] = useState<number[]>([1]);
  const toggleDirection = (id: number) => setOpenDirections((p) => p.includes(id) ? p.filter((d) => d !== id) : [...p, id]);
  const [showGroupDropdown, setShowGroupDropdown] = useState(false);
  const [selectedListenerGroup, setSelectedListenerGroup] = useState<string>("");
  const [newGroupForListener, setNewGroupForListener] = useState("");
  const [availableGroups, setAvailableGroups] = useState<string[]>([...groups]);
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");

  // STP фильтры
  const [stpFilterStatus, setStpFilterStatus] = useState("Все");
  const [stpFilterOrgs, setStpFilterOrgs] = useState<string[]>([]);
  const [stpFilterFio, setStpFilterFio] = useState<string[]>([]);
  const [stpFilterCourse, setStpFilterCourse] = useState("");

  const handleAddUser = () => {
    let valid = true;
    if (!newLastName.trim()) { setNameError("Введите фамилию"); valid = false; } else setNameError("");
    if (!newEmail.trim()) { setEmailError("Введите email"); valid = false; }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) { setEmailError("Некорректный email"); valid = false; }
    else setEmailError("");
    if (!valid) return;

    const fullName = [newLastName.trim(), newFirstName.trim(), newMiddleName.trim()].filter(Boolean).join(" ");
    const newUser: User = {
      id: Date.now(),
      name: fullName,
      email: newEmail.trim(),
      initials: getInitials(fullName),
      group: newGroup,
      role: newRole,
      assignments: selectedCourses.map((courseId) => ({ courseId, active: true, progress: 0, assignedAt: new Date().toLocaleDateString("ru-RU") })),
    };
    setUsers((prev) => [...prev, newUser]);
    setShowAddUser(false);
    setNewLastName(""); setNewFirstName(""); setNewMiddleName(""); setNewOrg("");
    setNewEmail(""); setNewInn(""); setNewGroup("ИБ-301"); setNewRole("Студент"); setSelectedCourses([]);
    setSelectedListenerGroup(""); setShowGroupDropdown(false);
    setSelectedUser(newUser);
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.group.toLowerCase().includes(search.toLowerCase())
  );

  const toggleCourse = (userId: number, courseId: number) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== userId) return u;
        const exists = u.assignments.find((a) => a.courseId === courseId);
        if (exists) {
          return { ...u, assignments: u.assignments.map((a) => a.courseId === courseId ? { ...a, active: !a.active } : a) };
        } else {
          return { ...u, assignments: [...u.assignments, { courseId, active: true, progress: 0, assignedAt: new Date().toLocaleDateString("ru-RU") }] };
        }
      })
    );
    setSelectedUser((prev) => {
      if (!prev || prev.id !== userId) return prev;
      const exists = prev.assignments.find((a) => a.courseId === courseId);
      if (exists) {
        return { ...prev, assignments: prev.assignments.map((a) => a.courseId === courseId ? { ...a, active: !a.active } : a) };
      } else {
        return { ...prev, assignments: [...prev.assignments, { courseId, active: true, progress: 0, assignedAt: new Date().toLocaleDateString("ru-RU") }] };
      }
    });
  };

  const totalAssignments = users.reduce((sum, u) => sum + u.assignments.filter((a) => a.active).length, 0);
  const totalCompleted = users.reduce((sum, u) => sum + u.assignments.filter((a) => a.progress === 100).length, 0);

  const { setStats } = useStats();
  useEffect(() => {
    setStats({ users: users.length, courses: 6, assignments: totalAssignments, completed: totalCompleted });
  }, [users, totalAssignments, totalCompleted]);

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

        <AdminTabBar activeTab={activeTab} setActiveTab={setActiveTab} />

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
