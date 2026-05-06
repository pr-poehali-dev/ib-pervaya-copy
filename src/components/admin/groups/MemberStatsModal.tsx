import { useState } from "react";
import Icon from "@/components/ui/icon";
import { User, Certificate, CourseAssignment } from "@/types/admin";
import { courseDirections, allCourses } from "@/components/admin/types";
import TestProtocolModal from "@/components/admin/certificates/TestProtocolModal";
import UserStatsModal from "@/components/admin/users/UserStatsModal";

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

function exportMemberCSV(member: User, assignment: CourseAssignment, courseTitle: string, totalMinutes: number, sessionsCount: number) {
  const rows = [
    ["Слушатель", member.name],
    ["Email", member.email],
    ["Организация", member.organization ?? ""],
    ["Группа", member.group ?? ""],
    ["Курс", courseTitle],
    ["Прогресс", `${assignment.progress}%`],
    ["Статус", assignment.status],
    ["Назначен", assignment.assignedAt],
    ["Активирован", assignment.activatedAt ?? "—"],
    ["Завершён", assignment.completedAt ?? "—"],
    ["Время в системе (мин)", String(totalMinutes)],
    ["Сессий", String(sessionsCount)],
    ["Результат теста", assignment.testScore !== undefined ? `${assignment.testScore}%` : "—"],
    ["Дата теста", assignment.testPassedAt ?? "—"],
  ];
  const csv = rows.map((r) => r.map((v) => `"${v}"`).join(";")).join("\n");
  const bom = "\uFEFF";
  const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${member.name}_${courseTitle}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportMemberPDF(member: User, assignment: CourseAssignment, courseTitle: string, totalMinutes: number, sessionsCount: number, avgSession: number) {
  const formatTime = (m: number) => { const h = Math.floor(m / 60); const min = m % 60; if (h === 0) return `${min} мин`; if (min === 0) return `${h} ч`; return `${h} ч ${min} мин`; };
  const lastVisit = assignment.completedAt ?? assignment.activatedAt ?? assignment.assignedAt;
  const html = `<!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8"><title>Статистика слушателя</title>
  <style>
    body { font-family: Arial, sans-serif; font-size: 13px; padding: 32px; color: #111; }
    h1 { font-size: 18px; margin-bottom: 4px; }
    .sub { color: #666; margin-bottom: 24px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th { text-align: left; background: #f3f4f6; padding: 8px 12px; font-size: 11px; text-transform: uppercase; letter-spacing: .05em; color: #555; }
    td { padding: 8px 12px; border-bottom: 1px solid #e5e7eb; }
    .badge { display: inline-block; padding: 2px 10px; border-radius: 8px; font-size: 12px; font-weight: 600; }
    .green { background: #d1fae5; color: #065f46; } .amber { background: #fef3c7; color: #92400e; }
    .progress-wrap { background: #e5e7eb; border-radius: 99px; height: 8px; width: 120px; overflow: hidden; }
    .progress-bar { height: 100%; background: linear-gradient(90deg,#8b5cf6,#7c3aed); border-radius: 99px; }
    @media print { body { padding: 16px; } }
  </style></head><body>
  <h1>Статистика обучения</h1>
  <div class="sub">${member.name} · ${courseTitle}</div>
  <table>
    <tr><th>Параметр</th><th>Значение</th></tr>
    <tr><td>Организация</td><td>${member.organization ?? "—"}</td></tr>
    <tr><td>Группа</td><td>${member.group ?? "—"}</td></tr>
    <tr><td>Назначен</td><td>${assignment.assignedAt}</td></tr>
    <tr><td>Активирован</td><td>${assignment.activatedAt ?? "—"}</td></tr>
    <tr><td>Завершён</td><td>${assignment.completedAt ?? "—"}</td></tr>
    <tr><td>Последний визит</td><td>${lastVisit ?? "—"}</td></tr>
    <tr><td>Прогресс</td><td><div class="progress-wrap"><div class="progress-bar" style="width:${assignment.progress}%"></div></div> ${assignment.progress}%</td></tr>
    <tr><td>Время в системе</td><td>${formatTime(totalMinutes)}</td></tr>
    <tr><td>Сессий</td><td>${sessionsCount}</td></tr>
    <tr><td>Среднее время сессии</td><td>${formatTime(avgSession)}</td></tr>
    <tr><td>Результат теста</td><td>${assignment.testScore !== undefined ? `<span class="badge ${assignment.testScore >= 70 ? "green" : "amber"}">${assignment.testScore}%</span>` : "—"}</td></tr>
    <tr><td>Дата теста</td><td>${assignment.testPassedAt ?? "—"}</td></tr>
  </table>
  </body></html>`;
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); }, 400);
}

export default function MemberStatsModal({ member, assignment, courseTitle, onClose }: Props) {
  const [showProtocol, setShowProtocol] = useState(false);
  const [showAllCourses, setShowAllCourses] = useState(false);

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

  if (showAllCourses) {
    return <UserStatsModal user={member} onClose={() => setShowAllCourses(false)} />;
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
              <p className="text-xs text-muted-foreground truncate max-w-[180px]">{courseTitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowAllCourses(true)}
              title="Сводный отчёт по всем курсам"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border hover:bg-violet-50 dark:hover:bg-violet-900/20 hover:border-violet-300 dark:hover:border-violet-700 text-muted-foreground hover:text-violet-600 dark:hover:text-violet-400 text-xs font-medium transition-colors"
            >
              <Icon name="LayoutList" size={13} />
              Все курсы
            </button>
            <button
              onClick={() => exportMemberCSV(member, assignment, courseTitle, totalMinutes, sessionsCount)}
              title="Скачать Excel (CSV)"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-300 dark:hover:border-emerald-700 text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 text-xs font-medium transition-colors"
            >
              <Icon name="FileSpreadsheet" size={13} />
              Excel
            </button>
            <button
              onClick={() => exportMemberPDF(member, assignment, courseTitle, totalMinutes, sessionsCount, avgSession)}
              title="Печать / сохранить PDF"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:border-rose-300 dark:hover:border-rose-700 text-muted-foreground hover:text-rose-600 dark:hover:text-rose-400 text-xs font-medium transition-colors"
            >
              <Icon name="FileText" size={13} />
              PDF
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors ml-1">
              <Icon name="X" size={16} />
            </button>
          </div>
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