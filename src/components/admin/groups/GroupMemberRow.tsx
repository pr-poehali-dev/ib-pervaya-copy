import { useState } from "react";
import Icon from "@/components/ui/icon";
import Tip from "@/components/ui/tip";
import ActivateMenu from "@/components/admin/shared/ActivateMenu";
import CourseStatusBadge from "@/components/admin/shared/CourseStatusBadge";
import UserAvatar from "@/components/admin/shared/UserAvatar";
import ProgressBar from "@/components/admin/shared/ProgressBar";
import LoginPasswordCell from "@/components/admin/shared/LoginPasswordCell";
import { User, allCourses, userColors, courseDirections } from "@/components/admin/types";
import { useRole } from "@/contexts/RoleContext";
import MemberStatsModal from "@/components/admin/groups/MemberStatsModal";
import { CourseAssignment } from "@/types/admin";
import { getMemberAssignments } from "./groupsUtils";

interface GroupMemberRowProps {
  member: User;
  mi: number;
  groupId: number;
  isExpanded: boolean;
  onToggle: (id: number) => void;
  onOpenStats: (user: User) => void;
  onAddCourse: (userId: number) => void;
  onActivateCourse: (userId: number, courseId: number, date: string, groupId: number) => void;
  onExtendCourse: (userId: number, courseId: number, groupId: number) => void;
  onIssueCertificate: (userId: number, courseId: number, groupId: number) => void;
  onToggleAssignment: (userId: number, courseId: number, groupId: number) => void;
  onEnrollToGroup: (user: User) => void;
}

export default function GroupMemberRow({
  member,
  mi,
  groupId,
  isExpanded,
  onToggle,
  onOpenStats,
  onAddCourse,
  onActivateCourse,
  onExtendCourse,
  onIssueCertificate,
  onToggleAssignment,
  onEnrollToGroup,
}: GroupMemberRowProps) {
  const [loginCopied, setLoginCopied] = useState(false);
  const [statsTarget, setStatsTarget] = useState<{ assignment: CourseAssignment; courseTitle: string } | null>(null);
  const { tenantType } = useRole();
  const canIssueCert = tenantType === "training_center";

  const assignments = getMemberAssignments(member, groupId);
  const activeCnt = assignments.filter((a) => a.active).length;
  const completedCnt = assignments.filter((a) => a.progress === 100).length;
  const avgProgress = activeCnt > 0
    ? Math.round(assignments.filter((a) => a.active).reduce((s, a) => s + a.progress, 0) / activeCnt)
    : 0;

  return (
    <>
      <tr
        className={`${mi > 0 ? "border-t border-border/60" : ""} cursor-pointer hover:bg-muted/20 transition-colors ${isExpanded ? "bg-violet-50/40 dark:bg-violet-900/10" : ""}`}
        onClick={() => onToggle(member.id)}
      >
        <td className="px-4 py-2.5">
          <Icon name={isExpanded ? "ChevronDown" : "ChevronRight"} size={14} className="text-muted-foreground" />
        </td>
        <td className="px-4 py-2.5">
          <div className="flex items-center gap-2">
            <UserAvatar gradient={userColors[mi % userColors.length]} initials={member.initials} size="sm" />
            <span className="font-medium text-sm">{member.name}</span>
          </div>
        </td>
        <td className="px-4 py-2.5" onClick={(e) => e.stopPropagation()}>
          <LoginPasswordCell
            email={member.email}
            loginCopied={loginCopied}
            onCopyLogin={() => { navigator.clipboard.writeText(member.email); setLoginCopied(true); setTimeout(() => setLoginCopied(false), 2000); }}
            maxEmailWidth="max-w-[120px]"
          />
        </td>
        <td className="px-4 py-2.5 text-sm text-muted-foreground">{activeCnt}</td>
        <td className="px-4 py-2.5 text-sm text-muted-foreground">{completedCnt}</td>
        <td className="px-4 py-2.5">
            <ProgressBar value={avgProgress} />
        </td>
        {/* Действия участника */}
        <td className="px-4 py-2.5" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-1">
            {assignments.length > 0 && (
              <Tip text="Статистика слушателя">
                <button
                  className="p-1.5 rounded-lg hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors text-muted-foreground hover:text-violet-600"
                  onClick={() => onOpenStats(member)}
                >
                  <Icon name="BarChart2" size={15} />
                </button>
              </Tip>
            )}
            <Tip text="Добавить курс участнику">
              <button
                className="p-1.5 rounded-lg hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors text-violet-600 dark:text-violet-400"
                onClick={() => { onAddCourse(member.id); if (!isExpanded) onToggle(member.id); }}
              >
                <Icon name="BookPlus" size={15} />
              </button>
            </Tip>
            <Tip text="Добавить в другую группу">
              <button
                className="p-1.5 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors text-emerald-600 dark:text-emerald-400"
                onClick={() => onEnrollToGroup(member)}
              >
                <Icon name="UserPlus" size={15} />
              </button>
            </Tip>
          </div>
        </td>
      </tr>

      {/* Курсы участника */}
      {isExpanded && (
        <tr key={`${member.id}-courses`} className="border-t border-border/60 bg-muted/10">
          <td colSpan={7} className="px-10 py-3">
            {assignments.length === 0 ? (
              <p className="text-xs text-muted-foreground">Курсы не назначены</p>
            ) : (
              <div className="rounded-xl border border-border overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground">Курс</th>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">Дата назначения</th>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">Дата активации</th>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">Дата завершения</th>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground">Прогресс</th>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground">Статус</th>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground">Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignments.map((a, ai) => {
                      const course = allCourses.find((c) => c.id === a.courseId)
                        ?? courseDirections.flatMap((d) => d.courses).find((c) => c.id === a.courseId);
                      if (!course) return null;
                      const courseTitle = "title" in course ? course.title : `${"code" in course ? course.code + " " : ""}${course.title}`;
                      const courseEmoji = "emoji" in course ? course.emoji : "📚";
                      return (
                        <tr key={a.courseId} className={`${ai > 0 ? "border-t border-border/60" : ""} hover:bg-muted/20`}>
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-1.5">
                              <span>{courseEmoji}</span>
                              <span className="font-medium">{courseTitle}</span>
                            </div>
                          </td>

                          {/* Дата назначения / Активировать */}
                          <td className="px-3 py-2">
                            {!a.activatedAt ? (
                              <ActivateMenu onActivate={(date) => onActivateCourse(member.id, a.courseId, date, groupId)} />
                            ) : (
                              <span className="text-muted-foreground text-xs">{a.assignedAt}</span>
                            )}
                          </td>

                          {/* Дата активации */}
                          <td className="px-3 py-2 text-muted-foreground">
                            {a.activatedAt ?? <span className="opacity-40">—</span>}
                          </td>

                          {/* Дата завершения */}
                          <td className="px-3 py-2 text-muted-foreground">
                            {a.completedAt ?? <span className="opacity-40">—</span>}
                          </td>

                          {/* Прогресс */}
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-1.5 min-w-[90px]">
                              <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full"
                                  style={{ width: `${a.progress}%` }}
                                />
                              </div>
                              <span className="text-muted-foreground w-7 text-right">{a.progress}%</span>
                              <Tip text="Статистика обучения">
                                <button
                                  className="p-1 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-violet-600 flex-shrink-0"
                                  onClick={(e) => { e.stopPropagation(); setStatsTarget({ assignment: a, courseTitle }); }}
                                >
                                  <Icon name="BarChart2" size={12} />
                                </button>
                              </Tip>
                            </div>
                          </td>

                          {/* Статус */}
                          <td className="px-3 py-2">
                            <CourseStatusBadge status={a.status} />
                          </td>

                          {/* Действия — иконки */}
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-0.5">
                              <Tip text={a.active ? "Отключить курс" : "Включить курс"}>
                                <button
                                  className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-destructive"
                                  onClick={() => onToggleAssignment(member.id, a.courseId, groupId)}
                                >
                                  <Icon name={a.active ? "ToggleRight" : "ToggleLeft"} size={15} />
                                </button>
                              </Tip>
                              <Tip text="Продлить курс">
                                <button
                                  className="p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400"
                                  onClick={() => onExtendCourse(member.id, a.courseId, groupId)}
                                >
                                  <Icon name="RefreshCw" size={14} />
                                </button>
                              </Tip>
                              {canIssueCert && (
                                <Tip text={a.status === "certified" ? "Удостоверение уже выдано" : "Выдать удостоверение"}>
                                  <button
                                    className={`p-1.5 rounded-lg transition-colors ${a.status === "certified" ? "text-violet-400 cursor-default" : "text-muted-foreground hover:bg-violet-100 dark:hover:bg-violet-900/30 hover:text-violet-600 dark:hover:text-violet-400"}`}
                                    onClick={() => a.status !== "certified" && onIssueCertificate(member.id, a.courseId, groupId)}
                                  >
                                    <Icon name="Award" size={15} />
                                  </button>
                                </Tip>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </td>
        </tr>
      )}

      {statsTarget && (
        <MemberStatsModal
          member={member}
          assignment={statsTarget.assignment}
          courseTitle={statsTarget.courseTitle}
          onClose={() => setStatsTarget(null)}
        />
      )}
    </>
  );
}