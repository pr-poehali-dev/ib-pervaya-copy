import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import Tip from "@/components/ui/tip";
import ActivateMenu from "@/components/admin/shared/ActivateMenu";
import UserStatusBadge from "./UserStatusBadge";
import UserAvatar from "@/components/admin/shared/UserAvatar";
import ProgressBar from "@/components/admin/shared/ProgressBar";
import LoginPasswordCell from "@/components/admin/shared/LoginPasswordCell";
import { User, CourseStatus, allCourses, userColors, courseDirections } from "@/components/admin/types";
import { useRole } from "@/contexts/RoleContext";
import MemberStatsModal from "@/components/admin/groups/MemberStatsModal";
import { CourseAssignment } from "@/types/admin";

interface UserTableRowProps {
  user: User;
  idx: number;
  isExpanded: boolean;
  isSelected: boolean;
  copiedId: number | null;
  onToggleRow: (id: number) => void;
  onToggleSelect: (id: number) => void;
  onCopyLogin: (id: number, email: string) => void;
  onOpenStats: (user: User) => void;
  onAddCourse: (userId: number) => void;
  onEditUser: (user: User) => void;
  onActivateCourse: (userId: number, courseId: number, date: string) => void;
  onExtendCourse: (userId: number, courseId: number) => void;
  onIssueCertificate: (userId: number, courseId: number) => void;
  onToggleCourse: (userId: number, courseId: number) => void;
  onEnrollToGroup: (user: User) => void;
}

export default function UserTableRow({
  user,
  idx,
  isExpanded,
  isSelected,
  copiedId,
  onToggleRow,
  onToggleSelect,
  onCopyLogin,
  onOpenStats,
  onAddCourse,
  onEditUser,
  onActivateCourse,
  onExtendCourse,
  onIssueCertificate,
  onToggleCourse,
  onEnrollToGroup,
}: UserTableRowProps) {
  const [statsTarget, setStatsTarget] = useState<{ assignment: CourseAssignment; courseTitle: string } | null>(null);
  const [historyTarget, setHistoryTarget] = useState<CourseAssignment | null>(null);
  const { tenantType } = useRole();
  const canIssueCert = tenantType === "training_center";
  const activeCourses = user.assignments.filter((a) => a.active);
  const completedCount = user.assignments.filter((a) => a.progress === 100).length;

  return (
    <>
      <tr
        className={`border-b border-border transition-colors cursor-pointer hover:bg-muted/20 ${isExpanded ? "bg-violet-50/50 dark:bg-violet-900/10" : ""} ${isSelected ? "bg-violet-50/30 dark:bg-violet-900/10" : ""}`}
        onClick={() => onToggleRow(user.id)}
      >
        {/* Чекбокс */}
        <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(user.id)}
            className="rounded border-border cursor-pointer accent-violet-600"
          />
        </td>

        {/* Expand toggle */}
        <td className="px-4 py-3">
          <Icon
            name={isExpanded ? "ChevronDown" : "ChevronRight"}
            size={16}
            className="text-muted-foreground"
          />
        </td>

        {/* ФИО */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-2.5">
            <UserAvatar gradient={userColors[idx % userColors.length]} initials={user.initials} />
            <div>
              <p className="font-medium leading-tight">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.role}</p>
            </div>
          </div>
        </td>

        {/* Организация */}
        <td className="px-4 py-3 text-sm text-muted-foreground max-w-[160px]">
          <span className="block truncate" title={user.organization}>{user.organization || "—"}</span>
        </td>

        {/* Группа */}
        <td className="px-4 py-3">
          {user.enrollments.length > 0 ? (
            <div className="flex flex-col gap-0.5">
              {user.enrollments.map((e) => (
                <Badge key={e.groupId} variant="secondary" className="text-xs w-fit">{e.groupName}</Badge>
              ))}
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          )}
        </td>

        {/* Курсы */}
        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {activeCourses.length} актив.
              {completedCount > 0 && ` · ${completedCount} завершено`}
            </span>
            {user.assignments.length > 0 && (
              <Tip text="Статистика слушателя" side="top">
                <button
                  className="p-1 rounded-md hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors text-muted-foreground hover:text-violet-600"
                  onClick={() => onOpenStats(user)}
                >
                  <Icon name="BarChart2" size={13} />
                </button>
              </Tip>
            )}
          </div>
        </td>

        {/* Логин */}
        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
          <LoginPasswordCell
            email={user.email}
            loginCopied={copiedId === user.id}
            onCopyLogin={() => onCopyLogin(user.id, user.email)}
          />
        </td>

        {/* Управление */}
        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-1.5">
            <Tip text="Редактировать слушателя">
              <button onClick={() => onEditUser(user)} className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                <Icon name="Pencil" size={16} />
              </button>
            </Tip>
            <Tip text="Активен / Неактивен">
              <button className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-emerald-600">
                <Icon name="ToggleRight" size={16} />
              </button>
            </Tip>
            <Tip text="Добавить курс">
              <button
                className="p-2 rounded-lg hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors text-violet-600 dark:text-violet-400"
                onClick={() => { onAddCourse(user.id); if (!isExpanded) onToggleRow(user.id); }}
              >
                <Icon name="BookPlus" size={16} />
              </button>
            </Tip>
            <Tip text="Добавить в группу">
              <button
                className="p-2 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors text-emerald-600 dark:text-emerald-400"
                onClick={() => onEnrollToGroup(user)}
              >
                <Icon name="UserPlus" size={16} />
              </button>
            </Tip>
          </div>
        </td>
      </tr>

      {/* Раскрытая строка — назначенные курсы */}
      {isExpanded && (
        <tr key={`${user.id}-expanded`} className="border-b border-border bg-violet-50/30 dark:bg-violet-900/5">
          <td colSpan={8} className="px-8 py-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Назначенные курсы</p>
                <button
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-100 dark:bg-violet-900/30 hover:bg-violet-200 dark:hover:bg-violet-900/50 transition-colors text-violet-700 dark:text-violet-300 text-xs font-medium"
                  onClick={() => onAddCourse(user.id)}
                >
                  <Icon name="Plus" size={13} />
                  Добавить курс
                </button>
              </div>
              {user.assignments.length === 0 ? (
                <p className="text-sm text-muted-foreground">Курсы не назначены</p>
              ) : (
                <div className="rounded-xl border border-border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Курс</th>
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground whitespace-nowrap">Дата назначения</th>
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground whitespace-nowrap">Дата активации</th>
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground whitespace-nowrap">Дата завершения</th>
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Прогресс</th>
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Статус</th>
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {user.assignments.map((a, i) => {
                        const course = allCourses.find((c) => c.id === a.courseId)
                          ?? courseDirections.flatMap((d) => d.courses).find((c) => c.id === a.courseId);
                        if (!course) return null;
                        const courseTitle = "title" in course ? course.title : `${"code" in course ? course.code + " " : ""}${course.title}`;
                        const courseEmoji = "emoji" in course ? course.emoji : "📚";
                        return (
                          <tr key={a.courseId} className={`${i > 0 ? "border-t border-border/60" : ""} hover:bg-muted/20`}>
                            <td className="px-4 py-2.5">
                              <div className="flex items-center gap-2">
                                <span className="text-base">{courseEmoji}</span>
                                <span className="font-medium text-sm">{courseTitle}</span>
                              </div>
                            </td>

                            {/* Дата назначения / кнопка Активировать */}
                            <td className="px-4 py-2.5">
                              {!a.activatedAt ? (
                                <ActivateMenu onActivate={(date) => onActivateCourse(user.id, a.courseId, date)} />
                              ) : (
                                <span className="text-xs text-muted-foreground">{a.assignedAt}</span>
                              )}
                            </td>

                            {/* Дата активации */}
                            <td className="px-4 py-2.5 text-xs text-muted-foreground">
                              {a.activatedAt ?? <span className="text-muted-foreground/50">—</span>}
                            </td>

                            {/* Дата завершения */}
                            <td className="px-4 py-2.5 text-xs text-muted-foreground">
                              {a.completedAt ?? <span className="text-muted-foreground/50">—</span>}
                            </td>

                            {/* Прогресс */}
                            <td className="px-4 py-2.5">
                              <div className="flex items-center gap-2">
                                <ProgressBar value={a.progress} minWidth="min-w-[80px]" />
                                <Tip text="Статистика обучения" side="top">
                                  <button
                                    className="p-1 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-violet-600 flex-shrink-0"
                                    onClick={(e) => { e.stopPropagation(); setStatsTarget({ assignment: a, courseTitle }); }}
                                  >
                                    <Icon name="BarChart2" size={13} />
                                  </button>
                                </Tip>
                              </div>
                            </td>

                            {/* Статус */}
                            <td className="px-4 py-2.5">
                              <UserStatusBadge status={a.status} />
                            </td>

                            {/* Действия */}
                            <td className="px-4 py-2.5">
                              <div className="flex items-center gap-0.5">
                                <Tip text={a.active ? "Отключить курс" : "Включить курс"} side="top">
                                  <button
                                    className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-destructive"
                                    onClick={() => onToggleCourse(user.id, a.courseId)}
                                  >
                                    <Icon name={a.active ? "ToggleRight" : "ToggleLeft"} size={15} />
                                  </button>
                                </Tip>
                                <Tip text="Продлить курс" side="top">
                                  <button
                                    className="p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400"
                                    onClick={() => onExtendCourse(user.id, a.courseId)}
                                  >
                                    <Icon name="RefreshCw" size={14} />
                                  </button>
                                </Tip>
                                {canIssueCert && (
                                  <Tip text={a.status === "certified" ? "Удостоверение уже выдано" : "Выдать удостоверение"} side="top">
                                    <button
                                      className={`p-1.5 rounded-lg transition-colors ${a.status === "certified" ? "text-violet-400 cursor-default" : "text-muted-foreground hover:bg-violet-100 dark:hover:bg-violet-900/30 hover:text-violet-600 dark:hover:text-violet-400"}`}
                                      onClick={() => a.status !== "certified" && onIssueCertificate(user.id, a.courseId)}
                                    >
                                      <Icon name="Award" size={15} />
                                    </button>
                                  </Tip>
                                )}
                                {(a.history?.length ?? 0) > 0 && (
                                  <Tip text="История изменений" side="top">
                                    <button
                                      className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground relative"
                                      onClick={() => setHistoryTarget(historyTarget?.courseId === a.courseId ? null : a)}
                                    >
                                      <Icon name="History" size={14} />
                                      <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-blue-500 rounded-full text-[8px] text-white flex items-center justify-center font-bold">{a.history!.length}</span>
                                    </button>
                                  </Tip>
                                )}
                              </div>
                              {historyTarget?.courseId === a.courseId && (
                                <div className="mt-2 rounded-xl border border-border bg-muted/30 overflow-hidden">
                                  {a.history!.map((h, hi) => (
                                    <div key={hi} className="flex items-center gap-2 px-3 py-1.5 border-b border-border last:border-0 text-xs">
                                      <Icon name="Clock" size={11} className="text-muted-foreground flex-shrink-0" />
                                      <span className="text-muted-foreground flex-shrink-0">{h.date}</span>
                                      <span className="font-medium flex-1">{h.action}</span>
                                      <span className="text-muted-foreground flex-shrink-0">{h.by}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}

      {statsTarget && (
        <MemberStatsModal
          member={user}
          assignment={statsTarget.assignment}
          courseTitle={statsTarget.courseTitle}
          onClose={() => setStatsTarget(null)}
        />
      )}
    </>
  );
}