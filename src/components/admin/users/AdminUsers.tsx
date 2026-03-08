import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import UserStatsModal from "./UserStatsModal";
import UserAddCourseModal from "./UserAddCourseModal";
import UserTableRow from "./UserTableRow";
import { User, CourseAssignment, CourseStatus, allCourses } from "@/components/admin/types";
import { MultiSelect, SearchSelect, FilterTags } from "@/components/admin/shared/FilterControls";
import { useRole } from "@/contexts/RoleContext";

interface AdminUsersProps {
  users: User[];
  filteredUsers: User[];
  toggleCourse: (userId: number, courseId: number) => void;
}

function today(): string {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
}

export default function AdminUsers({
  users,
  filteredUsers,
  toggleCourse,
}: AdminUsersProps) {
  const { tenantType } = useRole();
  const canIssueCert = tenantType === "training_center";
  const [filterStatus, setFilterStatus] = useState("Все");
  const [filterOrgs, setFilterOrgs] = useState<string[]>([]);
  const [filterFio, setFilterFio] = useState<string[]>([]);
  const [filterCourse, setFilterCourse] = useState("");
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [actionsOpen, setActionsOpen] = useState(false);

  const [addCourseForUser, setAddCourseForUser] = useState<number | null>(null);
  const [localUsers, setLocalUsers] = useState<User[]>(users);
  const [statsUser, setStatsUser] = useState<User | null>(null);

  const actionsButtonRef = useRef<HTMLButtonElement>(null);
  const actionsMenuRef = useRef<HTMLDivElement>(null);
  const [actionsPos, setActionsPos] = useState({ top: 0, right: 0 });

  const recalcActionsPos = useCallback(() => {
    if (!actionsButtonRef.current) return;
    const r = actionsButtonRef.current.getBoundingClientRect();
    setActionsPos({ top: r.bottom + window.scrollY + 4, right: window.innerWidth - r.right });
  }, []);

  useEffect(() => {
    if (actionsOpen) recalcActionsPos();
  }, [actionsOpen, recalcActionsPos]);

  useEffect(() => {
    if (!actionsOpen) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (
        actionsMenuRef.current && !actionsMenuRef.current.contains(t) &&
        actionsButtonRef.current && !actionsButtonRef.current.contains(t)
      ) setActionsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [actionsOpen]);

  const statusOptions = ["Все", "Есть активные курсы", "Завершил курсы", "Без назначений"];
  const orgOptions = useMemo(() => [...new Set(localUsers.map((u) => u.organization ?? "").filter(Boolean))], [localUsers]);
  const fioOptions = useMemo(() => localUsers.map((u) => u.name), [localUsers]);
  const courseOptions = useMemo(() => allCourses.map((c) => c.title), []);

  const resetFilters = () => {
    setFilterStatus("Все");
    setFilterOrgs([]);
    setFilterFio([]);
    setFilterCourse("");
  };

  const localFiltered = useMemo(() => {
    return filteredUsers.map((u) => localUsers.find((lu) => lu.id === u.id) ?? u).filter((u) => {
      if (filterStatus === "Есть активные курсы" && !u.assignments.some((a) => a.active)) return false;
      if (filterStatus === "Завершил курсы" && !u.assignments.some((a) => a.progress === 100)) return false;
      if (filterStatus === "Без назначений" && u.assignments.length > 0) return false;
      if (filterOrgs.length > 0 && !filterOrgs.includes(u.organization ?? "")) return false;
      if (filterFio.length > 0 && !filterFio.includes(u.name)) return false;
      if (filterCourse) {
        const course = allCourses.find((c) => c.title === filterCourse);
        if (course && !u.assignments.some((a) => a.courseId === course.id)) return false;
      }
      return true;
    });
  }, [filteredUsers, localUsers, filterStatus, filterOrgs, filterFio, filterCourse]);

  const toggleRow = (id: number) =>
    setExpandedRows((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });

  const copyLogin = (userId: number, email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedId(userId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const allChecked = localFiltered.length > 0 && localFiltered.every((u) => selectedIds.has(u.id));
  const someChecked = localFiltered.some((u) => selectedIds.has(u.id));

  const toggleSelectAll = () => {
    if (allChecked) {
      setSelectedIds((prev) => { const next = new Set(prev); localFiltered.forEach((u) => next.delete(u.id)); return next; });
    } else {
      setSelectedIds((prev) => { const next = new Set(prev); localFiltered.forEach((u) => next.add(u.id)); return next; });
    }
  };

  const toggleSelectOne = (id: number) => {
    setSelectedIds((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  };

  const activateCourse = (userId: number, courseId: number, date?: string) => {
    setLocalUsers((prev) => prev.map((u) => {
      if (u.id !== userId) return u;
      return {
        ...u,
        assignments: u.assignments.map((a) =>
          a.courseId !== courseId ? a : { ...a, activatedAt: date ?? today(), status: "active" as CourseStatus }
        ),
      };
    }));
  };

  const extendCourse = (userId: number, courseId: number) => {
    setLocalUsers((prev) => prev.map((u) => {
      if (u.id !== userId) return u;
      return {
        ...u,
        assignments: u.assignments.map((a) =>
          a.courseId !== courseId ? a : { ...a, status: "active" as CourseStatus, progress: Math.max(0, a.progress - 0) }
        ),
      };
    }));
  };

  const issueCertificate = (userId: number, courseId: number) => {
    setLocalUsers((prev) => prev.map((u) => {
      if (u.id !== userId) return u;
      return {
        ...u,
        assignments: u.assignments.map((a) =>
          a.courseId !== courseId ? a : { ...a, status: "certified" as CourseStatus, completedAt: a.completedAt ?? today() }
        ),
      };
    }));
  };

  const handleAddCourses = (userId: number, courseIds: number[]) => {
    setLocalUsers((prev) => prev.map((u) => {
      if (u.id !== userId) return u;
      const newAssignments: CourseAssignment[] = courseIds
        .filter((id) => !u.assignments.some((a) => a.courseId === id))
        .map((id) => ({ courseId: id, active: true, progress: 0, assignedAt: today(), status: "pending" as CourseStatus }));
      return { ...u, assignments: [...u.assignments, ...newAssignments] };
    }));
  };

  const handleToggleCourse = (userId: number, courseId: number) => {
    toggleCourse(userId, courseId);
    setLocalUsers((prev) => prev.map((u) => {
      if (u.id !== userId) return u;
      return {
        ...u,
        assignments: u.assignments.map((a) =>
          a.courseId !== courseId ? a : { ...a, active: !a.active }
        ),
      };
    }));
  };

  const addCourseUser = addCourseForUser !== null ? localUsers.find((u) => u.id === addCourseForUser) : null;

  return (
    <div className="space-y-4">
      {!canIssueCert && (
        <div className="flex items-start gap-3 px-4 py-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-2xl">
          <Icon name="Info" size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-700 dark:text-amber-400">
            Выдача удостоверений недоступна — ваш тенант зарегистрирован как <strong>Организация</strong>. Эта функция доступна только <strong>Учебным центрам</strong>.
          </p>
        </div>
      )}
      {addCourseForUser !== null && addCourseUser && (
        <UserAddCourseModal
          onClose={() => setAddCourseForUser(null)}
          onAdd={(ids) => handleAddCourses(addCourseForUser, ids)}
          alreadyAssigned={addCourseUser.assignments.map((a) => a.courseId)}
        />
      )}
      <UserStatsModal user={statsUser} onClose={() => setStatsUser(null)} />

      {/* Фильтры + кнопка действий */}
      <div className="flex items-start gap-3">
        <div className="flex-1 bg-card rounded-2xl border border-border px-4 pt-3 pb-3 space-y-2.5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Статус обучения</p>
              <SearchSelect options={statusOptions} value={filterStatus} onChange={setFilterStatus} placeholder="Все статусы" />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Организация</p>
              <MultiSelect options={orgOptions} selected={filterOrgs} onChange={setFilterOrgs} placeholder="Все организации" />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">ФИО обучающегося</p>
              <MultiSelect options={fioOptions} selected={filterFio} onChange={setFilterFio} placeholder="Все слушатели" />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Курс обучения</p>
              <SearchSelect options={courseOptions} value={filterCourse} onChange={setFilterCourse} placeholder="Все курсы" />
            </div>
          </div>
          <FilterTags
            filterStatus={filterStatus} setFilterStatus={setFilterStatus} defaultStatus="Все"
            filterOrgs={filterOrgs} setFilterOrgs={setFilterOrgs}
            filterFio={filterFio} setFilterFio={setFilterFio}
            filterCourse={filterCourse} setFilterCourse={setFilterCourse}
            onReset={resetFilters}
          />
        </div>

        {/* Кнопка действий */}
        <div className="flex-shrink-0 pt-6">
          <Button
            ref={actionsButtonRef}
            variant="outline"
            className="rounded-xl gap-2 h-9"
            onClick={() => setActionsOpen((p) => !p)}
            disabled={selectedIds.size === 0}
          >
            <Icon name="Zap" size={15} />
            Действия
            {selectedIds.size > 0 && (
              <span className="bg-violet-600 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">{selectedIds.size}</span>
            )}
            <Icon name="ChevronDown" size={14} />
          </Button>
          {actionsOpen && createPortal(
            <div
              ref={actionsMenuRef}
              style={{ position: "absolute", top: actionsPos.top, right: actionsPos.right, zIndex: 9999 }}
              className="bg-background border border-border rounded-xl shadow-2xl w-52 overflow-hidden"
            >
              {[
                { icon: "Send", label: "Отправить пароли" },
                { icon: "Download", label: "Скачать пароли" },
                { icon: "FileText", label: "Сформировать отчёт" },
              ].map((item) => (
                <button
                  key={item.label}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-muted/60 transition-colors text-left"
                  onClick={() => setActionsOpen(false)}
                >
                  <Icon name={item.icon} size={15} className="text-muted-foreground" />
                  {item.label}
                </button>
              ))}
            </div>,
            document.body
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Найдено: {localFiltered.length}
        {selectedIds.size > 0 && <span className="ml-2 text-violet-600 font-medium">· Выбрано: {selectedIds.size}</span>}
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
                    onChange={toggleSelectAll}
                    className="rounded border-border cursor-pointer accent-violet-600"
                  />
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground w-8"></th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">ФИО</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">Организация</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">Группа</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">Курсы</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Логин</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">Управление</th>
              </tr>
            </thead>
            <tbody>
              {localFiltered.map((user, idx) => (
                <UserTableRow
                  key={user.id}
                  user={user}
                  idx={idx}
                  isExpanded={expandedRows.has(user.id)}
                  isSelected={selectedIds.has(user.id)}
                  copiedId={copiedId}
                  onToggleRow={toggleRow}
                  onToggleSelect={toggleSelectOne}
                  onCopyLogin={copyLogin}
                  onOpenStats={(u) => setStatsUser(localUsers.find((lu) => lu.id === u.id) ?? u)}
                  onAddCourse={(userId) => setAddCourseForUser(userId)}
                  onActivateCourse={activateCourse}
                  onExtendCourse={extendCourse}
                  onIssueCertificate={issueCertificate}
                  onToggleCourse={handleToggleCourse}
                />
              ))}
            </tbody>
          </table>
        </div>

        {localFiltered.length === 0 && (
          <div className="p-10 text-center">
            <Icon name="SearchX" size={28} className="text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Слушатели не найдены</p>
          </div>
        )}
      </div>
    </div>
  );
}