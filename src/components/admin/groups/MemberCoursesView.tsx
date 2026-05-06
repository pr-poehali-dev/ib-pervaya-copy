import { useState } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import Tip from "@/components/ui/tip";
import ActivateMenu from "@/components/admin/shared/ActivateMenu";
import { User, CourseStatus, allCourses, courseDirections, userColors } from "@/components/admin/types";
import { useRole } from "@/contexts/RoleContext";
import MemberStatsModal from "./MemberStatsModal";
import { CourseAssignment } from "@/types/admin";

interface MemberCoursesViewProps {
  member: User;
  memberIndex: number;
  onAddCourse: (userId: number) => void;
  onActivateCourse: (userId: number, courseId: number, date: string) => void;
  onExtendCourse: (userId: number, courseId: number) => void;
  onIssueCertificate: (userId: number, courseId: number) => void;
  onToggleAssignment: (userId: number, courseId: number) => void;
}

function CourseStatusBadge({ status }: { status: CourseStatus }) {
  const map: Record<CourseStatus, { label: string; cls: string }> = {
    pending:   { label: "Ожидает активации",   cls: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300" },
    active:    { label: "Идёт обучение",        cls: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300" },
    completed: { label: "Обучение завершено",   cls: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" },
    certified: { label: "Удостоверение выдано", cls: "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300" },
  };
  const { label, cls } = map[status];
  return <span className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${cls}`}>{label}</span>;
}

const GRADIENTS = [
  "from-violet-400 to-purple-600",
  "from-cyan-400 to-blue-500",
  "from-emerald-400 to-teal-500",
  "from-amber-400 to-orange-500",
  "from-rose-400 to-pink-500",
  "from-indigo-400 to-blue-600",
];

export default function MemberCoursesView({
  member,
  memberIndex,
  onAddCourse,
  onActivateCourse,
  onExtendCourse,
  onIssueCertificate,
  onToggleAssignment,
}: MemberCoursesViewProps) {
  const { tenantType } = useRole();
  const canIssueCert = tenantType === "training_center";
  const [loginCopied, setLoginCopied] = useState(false);
  const [pwdCopied, setPwdCopied] = useState(false);
  const [statsTarget, setStatsTarget] = useState<{ assignment: CourseAssignment; courseTitle: string } | null>(null);

  const activeAssignments = member.assignments.filter((a) => a.active);
  const completedCount = member.assignments.filter((a) => a.progress === 100).length;
  const avgProgress = activeAssignments.length > 0
    ? Math.round(activeAssignments.reduce((s, a) => s + a.progress, 0) / activeAssignments.length)
    : 0;

  const gradient = GRADIENTS[memberIndex % GRADIENTS.length];

  return (
    <div className="space-y-4">
      {/* Карточка слушателя */}
      <div className="bg-card rounded-2xl border border-border p-5 flex items-center gap-5 flex-wrap">
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 shadow-sm`}>
          <span className="text-white font-bold text-lg">{member.initials}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-lg">{member.name}</h2>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-sm text-muted-foreground">{member.email}</span>
            <Tip text="Скопировать email">
              <button
                className="text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => { navigator.clipboard.writeText(member.email); setLoginCopied(true); setTimeout(() => setLoginCopied(false), 2000); }}
              >
                {loginCopied ? <Icon name="Check" size={12} className="text-emerald-500" /> : <Icon name="Copy" size={12} />}
              </button>
            </Tip>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-sm text-muted-foreground tracking-widest">••••••••</span>
            <Tip text="Скопировать пароль">
              <button
                className="text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => { navigator.clipboard.writeText("password123"); setPwdCopied(true); setTimeout(() => setPwdCopied(false), 2000); }}
              >
                {pwdCopied ? <Icon name="Check" size={12} className="text-emerald-500" /> : <Icon name="KeyRound" size={12} />}
              </button>
            </Tip>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs bg-muted px-2 py-0.5 rounded-md text-muted-foreground">{member.group}</span>
            <span className="text-xs bg-muted px-2 py-0.5 rounded-md text-muted-foreground">{member.role}</span>
          </div>
        </div>

        {/* Метрики */}
        <div className="flex gap-4">
          <div className="text-center">
            <p className="font-bold text-xl text-foreground">{activeAssignments.length}</p>
            <p className="text-xs text-muted-foreground">курсов</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-xl text-emerald-600">{completedCount}</p>
            <p className="text-xs text-muted-foreground">завершено</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-xl text-primary">{avgProgress}%</p>
            <p className="text-xs text-muted-foreground">прогресс</p>
          </div>
        </div>

        <Button
          className="rounded-xl gap-2 gradient-primary text-primary-foreground shadow-md ml-auto"
          onClick={() => onAddCourse(member.id)}
        >
          <Icon name="BookPlus" size={16} />
          Добавить курс
        </Button>
      </div>

      {/* Прогресс-бар общий */}
      {activeAssignments.length > 0 && (
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${gradient} rounded-full transition-all`}
            style={{ width: `${avgProgress}%` }}
          />
        </div>
      )}

      {/* Таблица курсов */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold text-sm">Назначенные курсы</h3>
          <span className="text-xs text-muted-foreground">{member.assignments.length} курс{member.assignments.length === 1 ? "" : member.assignments.length < 5 ? "а" : "ов"}</span>
        </div>

        {member.assignments.length === 0 ? (
          <div className="p-10 text-center">
            <Icon name="BookOpen" size={32} className="text-muted-foreground mx-auto mb-3" />
            <p className="font-medium">Курсы не назначены</p>
            <p className="text-muted-foreground text-sm mt-1">Нажмите «Добавить курс» чтобы назначить обучение</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Курс</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">Назначен</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">Активирован</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">Завершён</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Прогресс</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Статус</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Действия</th>
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
                    <tr
                      key={a.courseId}
                      className={`${ai > 0 ? "border-t border-border/60" : ""} hover:bg-muted/20 transition-colors ${!a.active ? "opacity-50" : ""}`}
                    >
                      {/* Курс */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{courseEmoji}</span>
                          <span className="font-medium">{courseTitle}</span>
                        </div>
                      </td>

                      {/* Дата назначения / Активировать */}
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {!a.activatedAt ? (
                          <ActivateMenu onActivate={(date) => onActivateCourse(member.id, a.courseId, date)} />
                        ) : (
                          a.assignedAt
                        )}
                      </td>

                      {/* Дата активации */}
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {a.activatedAt ?? <span className="opacity-40">—</span>}
                      </td>

                      {/* Дата завершения */}
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {a.completedAt ?? <span className="opacity-40">—</span>}
                      </td>

                      {/* Прогресс */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 min-w-[110px]">
                          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
                              style={{ width: `${a.progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground w-8 text-right">{a.progress}%</span>
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
                      <td className="px-4 py-3">
                        <CourseStatusBadge status={a.status} />
                      </td>

                      {/* Действия */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-0.5">
                          <Tip text={a.active ? "Отключить курс" : "Включить курс"}>
                            <button
                              className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-destructive"
                              onClick={() => onToggleAssignment(member.id, a.courseId)}
                            >
                              <Icon name={a.active ? "ToggleRight" : "ToggleLeft"} size={16} />
                            </button>
                          </Tip>
                          <Tip text="Продлить курс">
                            <button
                              className="p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-muted-foreground hover:text-blue-600"
                              onClick={() => onExtendCourse(member.id, a.courseId)}
                            >
                              <Icon name="RefreshCw" size={15} />
                            </button>
                          </Tip>
                          {canIssueCert && (
                            <Tip text={a.status === "certified" ? "Удостоверение уже выдано" : "Выдать удостоверение"}>
                              <button
                                disabled={a.status === "certified"}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  a.status === "certified"
                                    ? "text-violet-400 cursor-default"
                                    : "text-muted-foreground hover:bg-violet-100 dark:hover:bg-violet-900/30 hover:text-violet-600"
                                }`}
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
      </div>

      {statsTarget && (
        <MemberStatsModal
          member={member}
          assignment={statsTarget.assignment}
          courseTitle={statsTarget.courseTitle}
          onClose={() => setStatsTarget(null)}
        />
      )}
    </div>
  );
}