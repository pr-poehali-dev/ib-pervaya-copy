import { useState } from "react";
import Icon from "@/components/ui/icon";
import { User, Certificate, CourseAssignment } from "@/types/admin";
import { courseDirections, allCourses } from "@/components/admin/types";
import TestProtocolModal from "@/components/admin/certificates/TestProtocolModal";

interface Props {
  member: User;
  assignment: CourseAssignment;
  courseTitle: string;
  onClose: () => void;
}

function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} мин`;
  if (m === 0) return `${h} ч`;
  return `${h} ч ${m} мин`;
}

export default function MemberStatsModal({ member, assignment, courseTitle, onClose }: Props) {
  const [showProtocol, setShowProtocol] = useState(false);

  const seed = member.id * 17 + assignment.courseId * 3;
  const totalMinutes = 45 + (seed % 120);
  const sessionsCount = 3 + (seed % 8);
  const avgSession = Math.round(totalMinutes / sessionsCount);
  const lastVisit = assignment.completedAt ?? assignment.activatedAt ?? assignment.assignedAt;

  const hasBestTest = assignment.testScore !== undefined && assignment.testPassedAt;
  const bestScore = assignment.testScore ?? 0;

  const certForModal: Certificate = {
    id: member.id * 1000 + assignment.courseId,
    userId: member.id,
    userName: member.name,
    userEmail: member.email,
    userOrganization: member.organization,
    courseId: assignment.courseId,
    courseTitle,
    testScore: bestScore,
    testPassedAt: assignment.testPassedAt ?? "",
    status: "ready",
    tenantId: 0,
  };

  if (showProtocol) {
    return <TestProtocolModal cert={certForModal} onClose={() => setShowProtocol(false)} />;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card rounded-2xl border border-border shadow-xl w-full max-w-md flex flex-col">

        {/* Шапка */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {member.initials}
            </div>
            <div>
              <p className="font-semibold text-sm">{member.name}</p>
              <p className="text-xs text-muted-foreground truncate max-w-[220px]">{courseTitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
            <Icon name="X" size={16} />
          </button>
        </div>

        {/* Содержимое */}
        <div className="p-5 space-y-4">

          {/* Время в системе */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Время в системе</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-muted/40 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-foreground">{formatTime(totalMinutes)}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">всего</p>
              </div>
              <div className="bg-muted/40 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-foreground">{sessionsCount}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">сессий</p>
              </div>
              <div className="bg-muted/40 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-foreground">{formatTime(avgSession)}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">в среднем</p>
              </div>
            </div>
            {lastVisit && (
              <p className="text-xs text-muted-foreground mt-2">
                Последний визит: <span className="font-medium text-foreground">{lastVisit}</span>
              </p>
            )}
          </div>

          {/* Прогресс */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-muted-foreground font-semibold uppercase tracking-wide">Прогресс курса</span>
              <span className="font-semibold">{assignment.progress}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-600 transition-all"
                style={{ width: `${assignment.progress}%` }}
              />
            </div>
          </div>

          {/* Лучший результат теста */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Итоговый тест</p>
            {hasBestTest ? (
              <div className={`rounded-xl border-2 p-4 flex items-center justify-between ${bestScore >= 70 ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/10" : "border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10"}`}>
                <div>
                  <p className={`text-2xl font-bold ${bestScore >= 70 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
                    {bestScore}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {bestScore >= 70 ? "Зачтено" : "Не зачтено"} · {assignment.testPassedAt}
                  </p>
                </div>
                <button
                  onClick={() => setShowProtocol(true)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-background hover:bg-muted text-sm font-medium transition-colors"
                >
                  <Icon name="FileText" size={14} />
                  Протокол
                </button>
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-muted/20 p-4 text-center">
                <Icon name="Clock" size={20} className="text-muted-foreground mx-auto mb-1" />
                <p className="text-sm text-muted-foreground">Тест ещё не сдан</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
