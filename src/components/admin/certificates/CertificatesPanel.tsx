import { useState } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { CERTIFICATES } from "@/data/mockData";
import type { Certificate } from "@/components/admin/types";
import { CertBadge } from "./CertificateTemplate";
import IssueCertModal from "./IssueCertModal";
import ViewCertModal from "./ViewCertModal";
import TestProtocolModal from "./TestProtocolModal";

export default function CertificatesPanel() {
  const [certs, setCerts] = useState<Certificate[]>(CERTIFICATES);
  const [issueTarget, setIssueTarget] = useState<Certificate | null>(null);
  const [tab, setTab] = useState<"ready" | "issued" | "fis_frdo">("ready");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [viewCert, setViewCert] = useState<Certificate | null>(null);
  const [protocolCert, setProtocolCert] = useState<Certificate | null>(null);
  const [filterOrg, setFilterOrg] = useState<string>("");
  const [filterUser, setFilterUser] = useState<string>("");
  const [filterCourse, setFilterCourse] = useState<string>("");

  const ready  = certs.filter((c) => c.status === "ready");
  const issued = certs.filter((c) => c.status === "issued");
  const orgOptions = [...new Set(issued.map((c) => c.userOrganization).filter(Boolean))] as string[];
  const readyOrgOptions = [...new Set(ready.map((c) => c.userOrganization).filter(Boolean))] as string[];
  const courseOptions = [...new Set([...ready, ...issued].map((c) => c.courseTitle).filter(Boolean))] as string[];

  function handleIssue(certNum: string, issuedBy: string) {
    if (!issueTarget) return;
    setCerts((prev) =>
      prev.map((c) =>
        c.id === issueTarget.id
          ? {
              ...c,
              status: "issued",
              issuedAt: new Date().toLocaleDateString("ru-RU"),
              issuedBy,
              certificateNumber: certNum,
            }
          : c
      )
    );
    setIssueTarget(null);
  }

  function applyFilters(arr: Certificate[]) {
    return arr.filter((c) => {
      if (filterOrg && c.userOrganization !== filterOrg) return false;
      if (filterUser && !c.userName.toLowerCase().includes(filterUser.toLowerCase())) return false;
      if (filterCourse && c.courseTitle !== filterCourse) return false;
      return true;
    });
  }

  const list = tab === "ready"
    ? applyFilters(ready)
    : applyFilters(issued);

  const hasFilters = !!filterOrg || !!filterUser || !!filterCourse;

  function resetFilters() {
    setFilterOrg("");
    setFilterUser("");
    setFilterCourse("");
  }

  function toggleSelect(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === list.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(list.map((c) => c.id)));
    }
  }

  return (
    <div className="space-y-4">
      {issueTarget && (
        <IssueCertModal
          cert={issueTarget}
          onClose={() => setIssueTarget(null)}
          onIssue={handleIssue}
        />
      )}
      {protocolCert && (
        <TestProtocolModal cert={protocolCert} onClose={() => setProtocolCert(null)} />
      )}
      {viewCert && (
        <ViewCertModal cert={viewCert} onClose={() => setViewCert(null)} />
      )}

      {/* Переключатель */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab("ready")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${tab === "ready" ? "gradient-primary text-white border-transparent" : "border-border text-muted-foreground hover:bg-muted/60"}`}
        >
          <Icon name="Clock" size={15} />
          Готовы к выдаче
          {ready.length > 0 && (
            <span className="bg-amber-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {ready.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab("issued")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${tab === "issued" ? "gradient-primary text-white border-transparent" : "border-border text-muted-foreground hover:bg-muted/60"}`}
        >
          <Icon name="Award" size={15} />
          Выданные ({issued.length})
        </button>
        <button
          onClick={() => setTab("fis_frdo")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${tab === "fis_frdo" ? "gradient-primary text-white border-transparent" : "border-border text-muted-foreground hover:bg-muted/60"}`}
        >
          <Icon name="Database" size={15} />
          ФИС ФРДО
        </button>
      </div>

      {/* Уведомление */}
      {tab === "ready" && ready.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-2xl">
          <Icon name="AlertCircle" size={16} className="text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <p className="text-sm text-amber-800 dark:text-amber-300">
            <span className="font-semibold">{ready.length} слушателей</span> успешно сдали итоговый тест и ожидают выдачи удостоверения ДПО.
          </p>
        </div>
      )}

      {/* Панель фильтров — для табов «Готовы к выдаче» и «Выданные» */}
      {(tab === "ready" || tab === "issued") && (
        <div className="flex flex-wrap gap-2 items-center">
          {/* Поиск по слушателю */}
          <div className="relative">
            <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              placeholder="Слушатель..."
              className="h-9 pl-8 pr-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 w-44"
            />
          </div>

          {/* Фильтр по организации */}
          <select
            value={filterOrg}
            onChange={(e) => setFilterOrg(e.target.value)}
            className="h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 text-foreground"
          >
            <option value="">Все организации</option>
            {(tab === "ready" ? readyOrgOptions : orgOptions).map((org) => (
              <option key={org} value={org}>{org}</option>
            ))}
          </select>

          {/* Фильтр по курсу */}
          <select
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
            className="h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 text-foreground"
          >
            <option value="">Все курсы</option>
            {courseOptions.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {hasFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Icon name="X" size={12} />
              Сбросить
            </button>
          )}

          {selectedIds.size > 0 && (
            <span className="text-sm text-muted-foreground">Выбрано: {selectedIds.size}</span>
          )}

          {tab === "issued" && (
            <div className="ml-auto flex gap-2">
              <Button variant="outline" size="sm" className="rounded-xl gap-2 text-sm" disabled={selectedIds.size === 0}>
                <Icon name="Printer" size={14} />
                Печать
              </Button>
              <Button variant="outline" size="sm" className="rounded-xl gap-2 text-sm" disabled={selectedIds.size === 0}>
                <Icon name="Download" size={14} />
                Скачать
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ФИС ФРДО */}
      {tab === "fis_frdo" && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-200">
            <Icon name="Database" size={30} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold">ФИС ФРДО</h2>
            <p className="text-muted-foreground text-sm mt-1.5 max-w-sm">Раздел находится в разработке. Здесь будет интеграция с Федеральной информационной системой Федерального реестра документов об образовании.</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-600 font-medium">
            <Icon name="Clock" size={13} />
            В разработке
          </div>
        </div>
      )}

      {/* Таблица */}
      {tab !== "fis_frdo" && <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-3 py-3 w-8">
                  <input
                    type="checkbox"
                    className="rounded border-border"
                    checked={list.length > 0 && selectedIds.size === list.length}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Организация</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Слушатель</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Курс</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Код</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Часов</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Результат</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Дата теста</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Статус</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Действие</th>
              </tr>
            </thead>
            <tbody>
              {list.map((cert, idx) => (
                <tr key={cert.id} className={`border-b border-border last:border-0 hover:bg-muted/20 transition-colors ${selectedIds.has(cert.id) ? "bg-primary/5" : idx % 2 !== 0 ? "bg-muted/5" : ""}`}>
                  <td className="px-3 py-3 w-8">
                    <input
                      type="checkbox"
                      className="rounded border-border"
                      checked={selectedIds.has(cert.id)}
                      onChange={() => toggleSelect(cert.id)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm max-w-[160px] truncate" title={cert.userOrganization}>{cert.userOrganization ?? "—"}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium">{cert.userName}</p>
                      <p className="text-xs text-muted-foreground">{cert.userEmail}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm max-w-[200px] truncate" title={cert.courseTitle}>{cert.courseTitle}</p>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{cert.courseCode ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{cert.courseHours ? `${cert.courseHours} ч` : "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold ${cert.testScore >= 80 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
                        {cert.testScore}%
                      </span>
                      <button
                        title="Посмотреть протокол"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => setProtocolCert(cert)}
                      >
                        <Icon name="FileText" size={14} />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{cert.testPassedAt}</td>
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      <CertBadge status={cert.status} />
                      {cert.status === "issued" && cert.certificateNumber && (
                        <p className="text-xs text-muted-foreground font-mono">{cert.certificateNumber}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {cert.status === "ready" ? (
                      <Button
                        size="sm"
                        className="rounded-lg gradient-primary text-white text-xs h-7 px-3 gap-1"
                        onClick={() => setIssueTarget(cert)}
                      >
                        <Icon name="Award" size={12} />
                        Выдать
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-lg text-xs h-7 px-3 gap-1"
                          onClick={() => setViewCert(cert)}
                        >
                          <Icon name="Eye" size={12} />
                          Просмотреть
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 bg-muted/40 rounded-2xl flex items-center justify-center">
                        <Icon name="Award" size={22} className="text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground text-sm">
                        {tab === "ready" ? "Нет слушателей, готовых к получению удостоверения" : "Удостоверения ещё не выдавались"}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>}
    </div>
  );
}