import { useMemo, useState } from "react";
import Icon from "@/components/ui/icon";
import { User, allCourses, courseDirections, userColors } from "@/components/admin/types";

interface CertRegistryModalProps {
  open: boolean;
  onClose: () => void;
  users: User[];
}

interface CertEntry {
  num: number;
  userId: number;
  initials: string;
  name: string;
  email: string;
  group: string;
  role: string;
  courseId: number;
  courseTitle: string;
  issuedAt: string;
  assignedAt: string;
}

function getCourseTitle(courseId: number): string {
  const simple = allCourses.find((c) => c.id === courseId);
  if (simple) return simple.title;
  const dir = courseDirections.flatMap((d) => d.courses).find((c) => c.id === courseId);
  if (dir) return `${dir.code} ${dir.title}`;
  return `Курс #${courseId}`;
}

function exportCertCSV(entries: CertEntry[]) {
  const header = ["№", "ФИО", "Email", "Группа", "Роль", "Курс", "Дата выдачи", "Дата назначения"];
  const rows = entries.map((e) => [
    String(e.num), e.name, e.email, e.group, e.role, e.courseTitle, e.issuedAt, e.assignedAt,
  ]);
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const csv = "\uFEFF" + [header, ...rows].map((r) => r.map(escape).join(";")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Реестр_удостоверений_${new Date().toLocaleDateString("ru")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportCertPDF(entries: CertEntry[]) {
  const date = new Date().toLocaleDateString("ru", { day: "2-digit", month: "long", year: "numeric" });
  const rows = entries.map((e) => `
    <tr>
      <td style="color:#666">${e.num}</td>
      <td><b>${e.name}</b></td>
      <td style="color:#666">${e.group}</td>
      <td>${e.courseTitle}</td>
      <td style="color:#16a34a;font-weight:600">${e.issuedAt}</td>
      <td style="color:#666">${e.assignedAt}</td>
    </tr>`).join("");

  const html = `<!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8">
<title>Реестр выданных удостоверений</title>
<style>
  body { font-family: Arial, sans-serif; font-size: 11px; color: #111; padding: 28px; }
  h1 { font-size: 18px; margin-bottom: 2px; }
  .sub { color: #666; font-size: 10px; margin-bottom: 20px; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #f3f4f6; text-align: left; padding: 7px 9px; color: #555; font-size: 10px; }
  td { padding: 6px 9px; border-bottom: 1px solid #f0f0f0; }
  tr:last-child td { border: none; }
  @media print { body { padding: 14px; } }
</style></head><body>
<h1>Реестр выданных удостоверений</h1>
<div class="sub">Сформирован: ${date} · Всего удостоверений: ${entries.length}</div>
<table>
  <thead><tr><th>№</th><th>ФИО</th><th>Группа</th><th>Курс</th><th>Дата выдачи</th><th>Дата назначения</th></tr></thead>
  <tbody>${rows || "<tr><td colspan='6' style='color:#999;text-align:center;padding:20px'>Удостоверений не найдено</td></tr>"}</tbody>
</table>
</body></html>`;

  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); }, 400);
}

export default function CertRegistryModal({ open, onClose, users }: CertRegistryModalProps) {
  const [filterGroup, setFilterGroup] = useState("Все");
  const [filterCourse, setFilterCourse] = useState("Все");
  const [search, setSearch] = useState("");

  const allEntries = useMemo<CertEntry[]>(() => {
    const entries: CertEntry[] = [];
    let num = 1;
    users.forEach((u) => {
      u.assignments
        .filter((a) => a.status === "certified")
        .forEach((a) => {
          entries.push({
            num: num++,
            userId: u.id,
            initials: u.initials,
            name: u.name,
            email: u.email,
            group: u.group,
            role: u.role,
            courseId: a.courseId,
            courseTitle: getCourseTitle(a.courseId),
            issuedAt: a.completedAt ?? a.assignedAt,
            assignedAt: a.assignedAt,
          });
        });
    });
    return entries;
  }, [users]);

  const groupOptions = useMemo(() => ["Все", ...Array.from(new Set(users.map((u) => u.group))).sort()], [users]);
  const courseOptions = useMemo(() => ["Все", ...Array.from(new Set(allEntries.map((e) => e.courseTitle))).sort()], [allEntries]);

  const filtered = useMemo(() => {
    return allEntries.filter((e) => {
      if (filterGroup !== "Все" && e.group !== filterGroup) return false;
      if (filterCourse !== "Все" && e.courseTitle !== filterCourse) return false;
      if (search && !e.name.toLowerCase().includes(search.toLowerCase()) && !e.email.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [allEntries, filterGroup, filterCourse, search]);

  // Пересчитываем номера после фильтрации
  const numbered = filtered.map((e, i) => ({ ...e, num: i + 1 }));

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-background rounded-2xl border border-border shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col">

        {/* Шапка */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
              <Icon name="Award" size={20} className="text-white" />
            </div>
            <div>
              <h2 className="font-bold text-base leading-tight">Реестр выданных удостоверений</h2>
              <p className="text-xs text-muted-foreground">
                {allEntries.length} удостоверений · показано: {numbered.length}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportCertCSV(numbered)}
              title="Скачать Excel (CSV)"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-300 dark:hover:border-emerald-700 text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 text-xs font-medium transition-colors"
            >
              <Icon name="FileSpreadsheet" size={14} />
              Excel
            </button>
            <button
              onClick={() => exportCertPDF(numbered)}
              title="Печать / сохранить PDF"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:border-rose-300 dark:hover:border-rose-700 text-muted-foreground hover:text-rose-600 dark:hover:text-rose-400 text-xs font-medium transition-colors"
            >
              <Icon name="FileText" size={14} />
              PDF
            </button>
            <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors ml-1">
              <Icon name="X" size={18} />
            </button>
          </div>
        </div>

        {/* Фильтры */}
        <div className="flex flex-wrap gap-3 px-6 py-3 border-b border-border flex-shrink-0">
          {/* Поиск */}
          <div className="relative flex-1 min-w-[180px]">
            <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по ФИО или email..."
              className="w-full pl-8 pr-3 py-2 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"
            />
          </div>
          {/* Группа */}
          <select
            value={filterGroup}
            onChange={(e) => setFilterGroup(e.target.value)}
            className="px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 cursor-pointer"
          >
            {groupOptions.map((g) => <option key={g} value={g}>{g === "Все" ? "Все группы" : g}</option>)}
          </select>
          {/* Курс */}
          <select
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
            className="px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 cursor-pointer max-w-[220px]"
          >
            {courseOptions.map((c) => <option key={c} value={c}>{c === "Все" ? "Все курсы" : c}</option>)}
          </select>
          {/* Сброс */}
          {(filterGroup !== "Все" || filterCourse !== "Все" || search) && (
            <button
              onClick={() => { setFilterGroup("Все"); setFilterCourse("Все"); setSearch(""); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
            >
              <Icon name="X" size={13} />
              Сбросить
            </button>
          )}
        </div>

        {/* Сводка */}
        <div className="flex gap-4 px-6 py-3 border-b border-border bg-muted/20 flex-shrink-0">
          {[
            { label: "Всего удостоверений", value: allEntries.length, color: "text-emerald-500" },
            { label: "Уникальных слушателей", value: new Set(allEntries.map((e) => e.userId)).size, color: "text-violet-500" },
            { label: "Групп", value: new Set(allEntries.map((e) => e.group)).size, color: "text-cyan-500" },
            { label: "Курсов", value: new Set(allEntries.map((e) => e.courseId)).size, color: "text-amber-500" },
          ].map((m) => (
            <div key={m.label} className="flex items-center gap-2">
              <span className={`text-lg font-bold ${m.color}`}>{m.value}</span>
              <span className="text-xs text-muted-foreground">{m.label}</span>
            </div>
          ))}
        </div>

        {/* Таблица */}
        <div className="overflow-auto flex-1">
          {numbered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-20 text-center gap-3">
              <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center">
                <Icon name="Award" size={26} className="text-muted-foreground" />
              </div>
              <p className="font-semibold text-sm">Удостоверений не найдено</p>
              <p className="text-xs text-muted-foreground">Попробуйте изменить фильтры или сбросить поиск</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10">
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground w-10">№</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Слушатель</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Группа</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Курс</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground whitespace-nowrap">Дата выдачи</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground whitespace-nowrap">Дата назначения</th>
                </tr>
              </thead>
              <tbody>
                {numbered.map((e) => (
                  <tr key={`${e.userId}-${e.courseId}`} className="border-b border-border/60 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 text-xs text-muted-foreground">{e.num}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${userColors[e.userId % userColors.length]} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                          {e.initials}
                        </div>
                        <div>
                          <p className="font-medium leading-tight">{e.name}</p>
                          <p className="text-xs text-muted-foreground">{e.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-1 rounded-lg bg-muted text-xs font-medium">{e.group}</span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm leading-snug">{e.courseTitle}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-md bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                          <Icon name="Award" size={12} className="text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400 text-sm">{e.issuedAt}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{e.assignedAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Подвал */}
        <div className="border-t border-border px-6 py-3 flex items-center justify-between flex-shrink-0">
          <p className="text-xs text-muted-foreground">Показано {numbered.length} из {allEntries.length}</p>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-sm font-medium transition-colors"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}
