import Icon from "@/components/ui/icon";
import { PeriodPreset, PRESET_OPTIONS } from "./SubscriptionReportUtils";

interface SubscriptionReportFiltersProps {
  preset: PeriodPreset;
  onPresetChange: (p: PeriodPreset) => void;
  customFrom: string;
  customTo: string;
  onCustomFromChange: (v: string) => void;
  onCustomToChange: (v: string) => void;
  filterOrg: string;
  filterGroup: string;
  orgOptions: string[];
  groupOptions: string[];
  onFilterOrgChange: (v: string) => void;
  onFilterGroupChange: (v: string) => void;
  onResetFilters: () => void;
}

export default function SubscriptionReportFilters({
  preset,
  onPresetChange,
  customFrom,
  customTo,
  onCustomFromChange,
  onCustomToChange,
  filterOrg,
  filterGroup,
  orgOptions,
  groupOptions,
  onFilterOrgChange,
  onFilterGroupChange,
  onResetFilters,
}: SubscriptionReportFiltersProps) {
  return (
    <div className="px-6 py-4 border-b border-border bg-muted/20 flex-shrink-0 space-y-4">

      {/* Период */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Период</p>
        <div className="flex flex-wrap gap-2">
          {PRESET_OPTIONS.map((p) => (
            <button
              key={p.id}
              onClick={() => onPresetChange(p.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border transition-colors ${
                preset === p.id
                  ? "bg-violet-600 text-white border-violet-600"
                  : "border-border text-muted-foreground hover:bg-muted/60"
              }`}
            >
              <Icon name={p.icon} size={14} />
              {p.label}
            </button>
          ))}
        </div>
        {preset === "custom" && (
          <div className="flex items-center gap-3 pt-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground whitespace-nowrap">С</span>
              <input
                type="date"
                value={customFrom}
                onChange={(e) => onCustomFromChange(e.target.value)}
                className="px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 cursor-pointer"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground whitespace-nowrap">По</span>
              <input
                type="date"
                value={customTo}
                min={customFrom}
                onChange={(e) => onCustomToChange(e.target.value)}
                className="px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>

      {/* Фильтры */}
      <div className="flex flex-wrap gap-3">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Организация</p>
          <select
            value={filterOrg}
            onChange={(e) => onFilterOrgChange(e.target.value)}
            className="px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 cursor-pointer"
          >
            {orgOptions.map((o) => <option key={o} value={o}>{o === "Все" ? "Все организации" : o}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Группа</p>
          <select
            value={filterGroup}
            onChange={(e) => onFilterGroupChange(e.target.value)}
            className="px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 cursor-pointer"
          >
            {groupOptions.map((g) => <option key={g} value={g}>{g === "Все" ? "Все группы" : g}</option>)}
          </select>
        </div>
        {(filterOrg !== "Все" || filterGroup !== "Все") && (
          <div className="flex items-end">
            <button
              onClick={onResetFilters}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
            >
              <Icon name="X" size={13} />
              Сбросить
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
