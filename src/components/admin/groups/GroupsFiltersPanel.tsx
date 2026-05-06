import { useRef, useEffect, useCallback, RefObject } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { MultiSelect, SearchSelect, FilterTags } from "@/components/admin/shared/FilterControls";
import { User } from "@/components/admin/types";
import { getCourseInfo } from "./GroupStatsUtils";

type ViewMode = "table" | "cards";

const STATUS_OPTIONS = ["Все", "Обучается", "Завершено", "Не начато"];

interface GroupsFiltersPanelProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  onSwitchToCards: () => void;

  filterStatus: string;
  setFilterStatus: (v: string) => void;
  filterOrgs: string[];
  setFilterOrgs: (v: string[]) => void;
  filterGroups: string[];
  setFilterGroups: (v: string[]) => void;
  filterFio: string[];
  setFilterFio: (v: string[]) => void;
  filterCourse: string;
  setFilterCourse: (v: string) => void;
  orgOptions: string[];
  groupOptions: string[];
  fioOptions: string[];
  courseOptions: string[];
  onResetFilters: () => void;

  selectedGroupsSize: number;
  actionsOpen: boolean;
  setActionsOpen: (v: boolean) => void;
  actionsButtonRef: RefObject<HTMLButtonElement>;
  actionsMenuRef: RefObject<HTMLDivElement>;
  actionsPos: { top: number; right: number };
  selectedGroups: Set<string>;
  allUsers: User[];
}

export default function GroupsFiltersPanel({
  viewMode,
  setViewMode,
  onSwitchToCards,
  filterStatus,
  setFilterStatus,
  filterOrgs,
  setFilterOrgs,
  filterGroups,
  setFilterGroups,
  filterFio,
  setFilterFio,
  filterCourse,
  setFilterCourse,
  orgOptions,
  groupOptions,
  fioOptions,
  courseOptions,
  onResetFilters,
  selectedGroupsSize,
  actionsOpen,
  setActionsOpen,
  actionsButtonRef,
  actionsMenuRef,
  actionsPos,
  selectedGroups,
  allUsers,
}: GroupsFiltersPanelProps) {

  function exportStatsExcel() {
    const escape = (v: string) => `"${String(v).replace(/"/g, '""')}"`;
    const headers = ["№", "Организация", "Группа", "ФИО участника", "Курс", "Дата активации", "Дата завершения", "Дата лучшего теста", "Результат лучшего теста", "Кол-во попыток итогового теста"];

    const rows: string[][] = [];
    let idx = 1;

    [...selectedGroups].forEach((groupName) => {
      const members = allUsers.filter((u) => u.group === groupName);
      members.forEach((u) => {
        u.assignments.forEach((a) => {
          const info = getCourseInfo(a.courseId);
          rows.push([
            String(idx++),
            u.organization,
            groupName,
            u.name,
            info.title,
            a.activatedAt ?? "—",
            a.completedAt ?? "—",
            a.testPassedAt ?? "—",
            a.testScore != null ? `${a.testScore}%` : "—",
            a.testScore != null ? "1" : "0",
          ]);
        });
      });
    });

    const csv = "\uFEFF" + [headers, ...rows].map((r) => r.map(escape).join(";")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Статистика_обучения_${new Date().toLocaleDateString("ru")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setActionsOpen(false);
  }
  return (
    <div className="flex items-start gap-3">
      <div className="flex-1 bg-card rounded-2xl border border-border px-4 pt-3 pb-3 space-y-2.5">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Статус обучения группы</p>
            <SearchSelect options={STATUS_OPTIONS} value={filterStatus} onChange={setFilterStatus} placeholder="Все статусы" />
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Организация</p>
            <MultiSelect options={orgOptions} selected={filterOrgs} onChange={setFilterOrgs} placeholder="Все организации" />
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Группа</p>
            <MultiSelect options={groupOptions} selected={filterGroups} onChange={setFilterGroups} placeholder="Все группы" />
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
          filterGroups={filterGroups} setFilterGroups={setFilterGroups}
          filterFio={filterFio} setFilterFio={setFilterFio}
          filterCourse={filterCourse} setFilterCourse={setFilterCourse}
          onReset={onResetFilters}
        />
      </div>

      <div className="flex-shrink-0 pt-6 flex flex-col gap-2">
        <div className="flex rounded-xl border border-border overflow-hidden h-9">
          <button
            onClick={() => setViewMode("table")}
            className={`flex items-center justify-center px-3 transition-colors ${viewMode === "table" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted"}`}
            title="Таблица"
          >
            <Icon name="List" size={15} />
          </button>
          <button
            onClick={onSwitchToCards}
            className={`flex items-center justify-center px-3 transition-colors ${viewMode === "cards" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted"}`}
            title="Карточки"
          >
            <Icon name="LayoutGrid" size={15} />
          </button>
        </div>

        {viewMode === "table" && (
          <Button
            ref={actionsButtonRef}
            variant="outline"
            className="rounded-xl gap-2 h-9"
            onClick={() => setActionsOpen(!actionsOpen)}
            disabled={selectedGroupsSize === 0}
          >
            <Icon name="Zap" size={15} />
            Действия
            {selectedGroupsSize > 0 && (
              <span className="bg-primary text-primary-foreground text-xs rounded-full px-1.5 py-0.5 leading-none">{selectedGroupsSize}</span>
            )}
            <Icon name="ChevronDown" size={14} />
          </Button>
        )}

        {actionsOpen && createPortal(
          <div
            ref={actionsMenuRef}
            style={{ position: "absolute", top: actionsPos.top, right: actionsPos.right, zIndex: 9999 }}
            className="bg-background border border-border rounded-xl shadow-2xl w-52 overflow-hidden"
          >
            {[
              { icon: "Send",       label: "Отправить пароли",    action: () => setActionsOpen(false) },
              { icon: "Download",   label: "Скачать пароли",       action: () => setActionsOpen(false) },
              { icon: "FileText",   label: "Сформировать отчёт",   action: () => setActionsOpen(false) },
              { icon: "BarChart2",  label: "Статистика обучения",  action: exportStatsExcel },
            ].map((item) => (
              <button
                key={item.label}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted transition-colors text-left"
                onClick={item.action}
              >
                <Icon name={item.icon as "Send"} size={15} className="text-muted-foreground" />
                {item.label}
              </button>
            ))}
          </div>,
          document.body
        )}
      </div>
    </div>
  );
}