import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import Icon from "@/components/ui/icon";

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder,
}: {
  options: string[];
  selected: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = options.filter((o) => o.toLowerCase().includes(search.toLowerCase()));
  const toggle = (val: string) =>
    onChange(selected.includes(val) ? selected.filter((s) => s !== val) : [...selected, val]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 h-9 rounded-xl border border-border bg-background text-sm hover:border-violet-400 transition-colors"
      >
        <span className="truncate text-left">
          {selected.length === 0 ? (
            <span className="text-muted-foreground">{placeholder}</span>
          ) : selected.length === 1 ? (
            selected[0]
          ) : (
            <span>{selected[0]} <span className="text-muted-foreground">+{selected.length - 1}</span></span>
          )}
        </span>
        <Icon name={open ? "ChevronUp" : "ChevronDown"} size={14} className="text-muted-foreground flex-shrink-0" />
      </button>
      {open && (
        <div className="absolute z-30 top-full mt-1 left-0 w-full min-w-[220px] bg-background border border-border rounded-xl shadow-xl overflow-hidden">
          <div className="p-2 border-b border-border">
            <Input className="h-7 rounded-lg text-sm" placeholder="Поиск..." value={search} onChange={(e) => setSearch(e.target.value)} autoFocus />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filtered.length === 0 && <p className="text-xs text-muted-foreground px-3 py-2">Не найдено</p>}
            {filtered.map((opt) => (
              <label key={opt} className="flex items-center gap-2 px-3 py-2 hover:bg-muted/50 cursor-pointer transition-colors">
                <input type="checkbox" className="accent-violet-600 w-3.5 h-3.5 flex-shrink-0" checked={selected.includes(opt)} onChange={() => toggle(opt)} />
                <span className="text-sm">{opt}</span>
              </label>
            ))}
          </div>
          {selected.length > 0 && (
            <div className="p-2 border-t border-border">
              <button onClick={() => onChange([])} className="text-xs text-muted-foreground hover:text-foreground transition-colors">Сбросить выбор</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function SearchSelect({
  options,
  value,
  onChange,
  placeholder,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = options.filter((o) => o.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 h-9 rounded-xl border border-border bg-background text-sm hover:border-violet-400 transition-colors"
      >
        <span className={value ? "" : "text-muted-foreground"}>{value || placeholder}</span>
        <Icon name={open ? "ChevronUp" : "ChevronDown"} size={14} className="text-muted-foreground flex-shrink-0" />
      </button>
      {open && (
        <div className="absolute z-30 top-full mt-1 left-0 w-full min-w-[200px] bg-background border border-border rounded-xl shadow-xl overflow-hidden">
          <div className="p-2 border-b border-border">
            <Input className="h-7 rounded-lg text-sm" placeholder="Поиск..." value={search} onChange={(e) => setSearch(e.target.value)} autoFocus />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filtered.map((opt) => (
              <button
                key={opt}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-muted/50 transition-colors flex items-center justify-between ${value === opt ? "text-violet-600 font-medium" : ""}`}
                onClick={() => { onChange(opt === value ? "" : opt); setOpen(false); setSearch(""); }}
              >
                {opt}
                {value === opt && <Icon name="Check" size={13} className="text-violet-600" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function FilterTags({
  filterStatus, setFilterStatus, defaultStatus,
  filterOrgs, setFilterOrgs,
  filterFio, setFilterFio,
  filterCourse, setFilterCourse,
  onReset,
}: {
  filterStatus: string; setFilterStatus: (v: string) => void; defaultStatus: string;
  filterOrgs: string[]; setFilterOrgs: (v: string[]) => void;
  filterFio: string[]; setFilterFio: (v: string[]) => void;
  filterCourse: string; setFilterCourse: (v: string) => void;
  onReset: () => void;
}) {
  const hasFilters = filterStatus !== defaultStatus || filterOrgs.length > 0 || filterFio.length > 0 || filterCourse;
  if (!hasFilters) return null;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <button onClick={onReset} className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
        <Icon name="X" size={11} />Сбросить
      </button>
      {filterStatus !== defaultStatus && (
        <span className="flex items-center gap-1 px-2 py-0.5 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-lg text-xs font-medium">
          {filterStatus}<button onClick={() => setFilterStatus(defaultStatus)} className="hover:text-destructive">×</button>
        </span>
      )}
      {filterOrgs.map((o) => (
        <span key={o} className="flex items-center gap-1 px-2 py-0.5 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 rounded-lg text-xs font-medium">
          {o}<button onClick={() => setFilterOrgs(filterOrgs.filter((x) => x !== o))} className="hover:text-destructive">×</button>
        </span>
      ))}
      {filterFio.map((f) => (
        <span key={f} className="flex items-center gap-1 px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-medium">
          {f}<button onClick={() => setFilterFio(filterFio.filter((x) => x !== f))} className="hover:text-destructive">×</button>
        </span>
      ))}
      {filterCourse && (
        <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-lg text-xs font-medium">
          {filterCourse}<button onClick={() => setFilterCourse("")} className="hover:text-destructive">×</button>
        </span>
      )}
    </div>
  );
}
