import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import type { TenantType } from "@/components/admin/types";

type ViewMode = "table" | "cards";

interface TenantsFiltersBarProps {
  search: string;
  setSearch: (v: string) => void;
  typeFilter: "all" | TenantType;
  setTypeFilter: (v: "all" | TenantType) => void;
  viewMode: ViewMode;
  setViewMode: (v: ViewMode) => void;
  canCreate: boolean;
  onAdd: () => void;
}

export default function TenantsFiltersBar({
  search, setSearch,
  typeFilter, setTypeFilter,
  viewMode, setViewMode,
  canCreate, onAdd,
}: TenantsFiltersBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 sticky top-0 z-10 bg-background/95 backdrop-blur-sm py-2 -mx-1 px-1 rounded-xl">
      <div className="relative flex-1 min-w-[200px]">
        <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск по названию или ИНН..."
          className="w-full h-9 pl-9 pr-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30"
        />
      </div>

      <div className="flex gap-1 bg-muted/40 rounded-xl p-1">
        {([["all", "Все"], ["training_center", "УЦ"], ["organization", "Организации"]] as const).map(([val, label]) => (
          <button
            key={val}
            onClick={() => setTypeFilter(val)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${typeFilter === val ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Переключатель вида */}
      <div className="flex gap-1 bg-muted/40 rounded-xl p-1">
        <button
          onClick={() => setViewMode("table")}
          className={`p-1.5 rounded-lg transition-colors ${viewMode === "table" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          title="Таблица"
        >
          <Icon name="LayoutList" size={15} />
        </button>
        <button
          onClick={() => setViewMode("cards")}
          className={`p-1.5 rounded-lg transition-colors ${viewMode === "cards" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          title="Карточки"
        >
          <Icon name="LayoutGrid" size={15} />
        </button>
      </div>

      {canCreate && (
        <Button className="gradient-primary text-white rounded-xl gap-2 h-9 flex-shrink-0" onClick={onAdd}>
          <Icon name="Plus" size={15} />
          Добавить тенанта
        </Button>
      )}
    </div>
  );
}
