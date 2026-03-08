import { useState } from "react";
import Icon from "@/components/ui/icon";
import Tip from "@/components/ui/tip";
import ActivateMenu from "@/components/admin/shared/ActivateMenu";
import { User, CourseStatus, allCourses, userColors, courseDirections } from "@/components/admin/types";
import { useRole } from "@/contexts/RoleContext";

function CourseStatusBadge({ status }: { status: CourseStatus }) {
  const map: Record<CourseStatus, { label: string; cls: string }> = {
    pending:   { label: "Ожидает активации",   cls: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300" },
    active:    { label: "Идёт обучение",        cls: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300" },
    completed: { label: "Обучение завершено",   cls: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" },
    certified: { label: "Удостоверение выдано", cls: "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300" },
  };
  const { label, cls } = map[status];
  return <span className={`px-2 py-0.5 rounded-md text-xs font-medium whitespace-nowrap ${cls}`}>{label}</span>;
}

interface GroupMemberRowProps {
  member: User;
  mi: number;
  isExpanded: boolean;
  onToggle: (id: number) => void;
  onOpenStats: (user: User) => void;
  onAddCourse: (userId: number) => void;
  onActivateCourse: (userId: number, courseId: number, date: string) => void;
  onExtendCourse: (userId: number, courseId: number) => void;
  onIssueCertificate: (userId: number, courseId: number) => void;
  onToggleAssignment: (userId: number, courseId: number) => void;
}

export default function GroupMemberRow({
  member,
  mi,
  isExpanded,
  onToggle,
  onOpenStats,
  onAddCourse,
  onActivateCourse,
  onExtendCourse,
  onIssueCertificate,
  onToggleAssignment,
}: GroupMemberRowProps) {
  const [loginCopied, setLoginCopied] = useState(false);
  const [pwdCopied, setPwdCopied] = useState(false);
  const { tenantType } = useRole();
  const canIssueCert = tenantType === "training_center";
  const activeCnt = member.assignments.filter((a) => a.active).length;
  const completedCnt = member.assignments.filter((a) => a.progress === 100).length;
  const avgProgress = activeCnt > 0
    ? Math.round(member.assignments.filter((a) => a.active).reduce((s, a) => s + a.progress, 0) / activeCnt)
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
            <div className={`w-7 h-7 bg-gradient-to-br ${userColors[mi % userColors.length]} rounded-md flex items-center justify-center flex-shrink-0`}>
              <span className="text-white font-bold text-[9px]">{member.initials}</span>
            </div>
            <span className="font-medium text-sm">{member.name}</span>
          </div>
        </td>
        <td className="px-4 py-2.5" onClick={(e) => e.stopPropagation()}>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground truncate max-w-[120px]">{member.email}</span>
              <Tip text="Скопировать логин">
                <button
                  className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                  onClick={() => { navigator.clipboard.writeText(member.email); setLoginCopied(true); setTimeout(() => setLoginCopied(false), 2000); }}
                >
                  {loginCopied ? <Icon name="Check" size={12} className="text-emerald-500" /> : <Icon name="Copy" size={12} />}
                </button>
              </Tip>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground tracking-widest">••••••••</span>
              <Tip text="Скопировать пароль">
                <button
                  className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                  onClick={() => { navigator.clipboard.writeText("••••••••"); setPwdCopied(true); setTimeout(() => setPwdCopied(false), 2000); }}
                >
                  {pwdCopied ? <Icon name="Check" size={12} className="text-emerald-500" /> : <Icon name="KeyRound" size={12} />}
                </button>
              </Tip>
            </div>
          </div>
        </td>
        <td className="px-4 py-2.5 text-sm text-muted-foreground">{activeCnt}</td>
        <td className="px-4 py-2.5 text-sm text-muted-foreground">{completedCnt}</td>
        <td className="px-4 py-2.5">
          {activeCnt > 0 ? (
            <div className="flex items-center gap-2 min-w-[100px]">
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full"
                  style={{ width: `${avgProgress}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground w-8 text-right">{avgProgress}%</span>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          )}
        </td>
        {/* Действия участника */}
        <td className="px-4 py-2.5" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-1">
            {member.assignments.length > 0 && (
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
          </div>
        </td>
      </tr>

      {/* Курсы участника */}
      {isExpanded && (
        <tr key={`${member.id}-courses`} className="border-t border-border/60 bg-muted/10">
          <td colSpan={7} className="px-10 py-3">
            {member.assignments.length === 0 ? (
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
                    {member.assignments.map((a, ai) => {
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
                              <ActivateMenu onActivate={(date) => onActivateCourse(member.id, a.courseId, date)} />
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
                                <button className="p-1 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-violet-600 flex-shrink-0">
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
                                  onClick={() => onToggleAssignment(member.id, a.courseId)}
                                >
                                  <Icon name={a.active ? "ToggleRight" : "ToggleLeft"} size={15} />
                                </button>
                              </Tip>
                              <Tip text="Продлить курс">
                                <button
                                  className="p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400"
                                  onClick={() => onExtendCourse(member.id, a.courseId)}
                                >
                                  <Icon name="RefreshCw" size={14} />
                                </button>
                              </Tip>
                              {canIssueCert && (
                                <Tip text={a.status === "certified" ? "Удостоверение уже выдано" : "Выдать удостоверение"}>
                                  <button
                                    className={`p-1.5 rounded-lg transition-colors ${a.status === "certified" ? "text-violet-400 cursor-default" : "text-muted-foreground hover:bg-violet-100 dark:hover:bg-violet-900/30 hover:text-violet-600 dark:hover:text-violet-400"}`}
                                    onClick={() => a.status !== "certified" && onIssueCertificate(member.id, a.courseId)}
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
    </>
  );
}