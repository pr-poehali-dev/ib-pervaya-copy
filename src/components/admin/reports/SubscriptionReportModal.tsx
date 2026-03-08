import { useMemo, useState } from "react";
import Icon from "@/components/ui/icon";
import { User } from "@/components/admin/types";
import {
  LineItem,
  PeriodPreset,
  ViewMode,
  getNow,
  getPeriodBounds,
  inPeriod,
  dateToInput,
  inputToDMY,
  getCourseTitle,
  exportSubCSV,
  exportSubPDF,
} from "./SubscriptionReportUtils";
import SubscriptionReportFilters from "./SubscriptionReportFilters";
import SubscriptionReportGroupsView from "./SubscriptionReportGroupsView";
import SubscriptionReportDetailView from "./SubscriptionReportDetailView";

interface SubscriptionReportModalProps {
  open: boolean;
  onClose: () => void;
  users: User[];
}

export default function SubscriptionReportModal({ open, onClose, users }: SubscriptionReportModalProps) {
  const [preset, setPreset] = useState<PeriodPreset>("cur_month");
  const [customFrom, setCustomFrom] = useState(dateToInput(new Date(getNow().getFullYear(), 0, 1)));
  const [customTo,   setCustomTo]   = useState(dateToInput(getNow()));
  const [filterOrg,   setFilterOrg]   = useState("Все");
  const [filterGroup, setFilterGroup] = useState("Все");
  const [view, setView] = useState<ViewMode>("groups");
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  const { from, to, label: periodLabel } = useMemo(
    () => getPeriodBounds(preset, inputToDMY(customFrom), inputToDMY(customTo)),
    [preset, customFrom, customTo]
  );

  const orgOptions = useMemo(() => ["Все", ...Array.from(new Set(users.map((u) => u.organization ?? "").filter(Boolean))).sort()], [users]);
  const groupOptions = useMemo(() => {
    const base = filterOrg === "Все" ? users : users.filter((u) => (u.organization ?? "") === filterOrg);
    return ["Все", ...Array.from(new Set(base.map((u) => u.group))).sort()];
  }, [users, filterOrg]);

  const lineItems = useMemo<LineItem[]>(() => {
    const items: LineItem[] = [];
    users.forEach((u) => {
      if (filterOrg !== "Все" && (u.organization ?? "") !== filterOrg) return;
      if (filterGroup !== "Все" && u.group !== filterGroup) return;
      u.assignments.forEach((a) => {
        if (inPeriod(a.assignedAt, from, to)) {
          items.push({
            userId: u.id,
            initials: u.initials,
            name: u.name,
            organization: u.organization ?? "",
            group: u.group,
            email: u.email,
            courseId: a.courseId,
            courseTitle: getCourseTitle(a.courseId),
            assignedAt: a.assignedAt,
          });
        }
      });
    });
    return items;
  }, [users, from, to, filterOrg, filterGroup]);

  const groupSummary = useMemo(() => {
    const map = new Map<string, { count: number; items: LineItem[] }>();
    lineItems.forEach((item) => {
      const prev = map.get(item.group) ?? { count: 0, items: [] };
      map.set(item.group, { count: prev.count + 1, items: [...prev.items, item] });
    });
    return Array.from(map.entries())
      .map(([group, v], idx) => ({ group, count: v.count, items: v.items, idx }))
      .sort((a, b) => b.count - a.count);
  }, [lineItems]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-background rounded-2xl border border-border shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col">

        {/* Шапка */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-700 rounded-xl flex items-center justify-center">
              <Icon name="CreditCard" size={20} className="text-white" />
            </div>
            <div>
              <h2 className="font-bold text-base leading-tight">Списание подписок за период</h2>
              <p className="text-xs text-muted-foreground">Детализация назначений по организациям и группам</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportSubCSV(lineItems, periodLabel, filterOrg, filterGroup)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-300 dark:hover:border-emerald-700 text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 text-xs font-medium transition-colors"
            >
              <Icon name="FileSpreadsheet" size={14} />
              Excel
            </button>
            <button
              onClick={() => exportSubPDF(lineItems, periodLabel, groupSummary, filterOrg, filterGroup)}
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

        {/* Параметры + фильтры */}
        <SubscriptionReportFilters
          preset={preset}
          onPresetChange={setPreset}
          customFrom={customFrom}
          customTo={customTo}
          onCustomFromChange={setCustomFrom}
          onCustomToChange={setCustomTo}
          filterOrg={filterOrg}
          filterGroup={filterGroup}
          orgOptions={orgOptions}
          groupOptions={groupOptions}
          onFilterOrgChange={(v) => { setFilterOrg(v); setFilterGroup("Все"); }}
          onFilterGroupChange={setFilterGroup}
          onResetFilters={() => { setFilterOrg("Все"); setFilterGroup("Все"); }}
        />

        {/* Сводка */}
        <div className="flex items-center gap-6 px-6 py-3 border-b border-border flex-shrink-0 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-violet-500">{lineItems.length}</span>
            <span className="text-xs text-muted-foreground">назначений</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-cyan-500">{new Set(lineItems.map((i) => i.userId)).size}</span>
            <span className="text-xs text-muted-foreground">слушателей</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-blue-500">{groupSummary.length}</span>
            <span className="text-xs text-muted-foreground">групп</span>
          </div>
          <div className="ml-auto flex items-center gap-2 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-xl px-4 py-2">
            <Icon name="Calendar" size={14} className="text-violet-500" />
            <span className="text-xs text-muted-foreground">Период:</span>
            <span className="text-sm font-semibold text-violet-700 dark:text-violet-300">{periodLabel}</span>
          </div>
        </div>

        {/* Переключатель вида */}
        <div className="flex gap-1 px-6 pt-3 flex-shrink-0">
          {([["groups", "UsersRound", "По группам"], ["detail", "List", "Детализация"]] as const).map(([id, icon, label]) => (
            <button
              key={id}
              onClick={() => setView(id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                view === id
                  ? "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300"
                  : "text-muted-foreground hover:bg-muted/60"
              }`}
            >
              <Icon name={icon} size={14} />
              {label}
            </button>
          ))}
        </div>

        {/* Контент */}
        <div className="overflow-y-auto flex-1 p-6">
          {lineItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-16 text-center gap-3">
              <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center">
                <Icon name="CreditCard" size={26} className="text-muted-foreground" />
              </div>
              <p className="font-semibold text-sm">Нет назначений за выбранный период</p>
              <p className="text-xs text-muted-foreground">Попробуйте изменить период или сбросить фильтры</p>
            </div>
          ) : view === "groups" ? (
            <SubscriptionReportGroupsView
              groupSummary={groupSummary}
              lineItems={lineItems}
              periodLabel={periodLabel}
              expandedGroup={expandedGroup}
              onToggleGroup={(group) => setExpandedGroup(expandedGroup === group ? null : group)}
            />
          ) : (
            <SubscriptionReportDetailView lineItems={lineItems} />
          )}
        </div>
      </div>
    </div>
  );
}