import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";

interface ActivateMenuProps {
  onActivate: (date: string) => void;
}

function todayIso(): string {
  return new Date().toISOString().split("T")[0];
}

function isoToDisplay(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}

export default function ActivateMenu({ onActivate }: ActivateMenuProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"menu" | "datepicker">("menu");
  const [pickedDate, setPickedDate] = useState(todayIso());
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Позиционируем меню под кнопкой
  useEffect(() => {
    if (!open || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setPos({
      top: rect.bottom + window.scrollY + 4,
      left: rect.left + window.scrollX,
    });
  }, [open]);

  // Закрытие по клику вне
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (
        menuRef.current && !menuRef.current.contains(t) &&
        triggerRef.current && !triggerRef.current.contains(t)
      ) {
        setOpen(false);
        setMode("menu");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleNow = () => {
    onActivate(isoToDisplay(todayIso()));
    setOpen(false);
    setMode("menu");
  };

  const handleSetDate = () => {
    onActivate(isoToDisplay(pickedDate));
    setOpen(false);
    setMode("menu");
  };

  const menu = open ? createPortal(
    <div
      ref={menuRef}
      style={{ position: "absolute", top: pos.top, left: pos.left, zIndex: 9999 }}
      className="bg-background border border-border rounded-xl shadow-2xl overflow-hidden w-56"
    >
      {mode === "menu" ? (
        <>
          <button
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-muted/60 transition-colors text-left"
            onClick={handleNow}
          >
            <Icon name="Zap" size={14} className="text-amber-500 flex-shrink-0" />
            Начать курс сейчас
          </button>
          <button
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-muted/60 transition-colors text-left border-t border-border"
            onClick={() => setMode("datepicker")}
          >
            <Icon name="CalendarDays" size={14} className="text-blue-500 flex-shrink-0" />
            Начать с выбранной даты
          </button>
        </>
      ) : (
        <div className="p-3 space-y-2.5">
          <p className="text-xs font-medium text-muted-foreground">Выберите дату начала</p>
          <input
            type="date"
            value={pickedDate}
            onChange={(e) => setPickedDate(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          <div className="flex gap-2">
            <button
              className="flex-1 text-xs px-2 py-1.5 rounded-lg border border-border hover:bg-muted/60 transition-colors"
              onClick={() => setMode("menu")}
            >
              Назад
            </button>
            <Button
              size="sm"
              className="flex-1 gradient-primary text-white rounded-lg text-xs h-auto py-1.5"
              disabled={!pickedDate}
              onClick={handleSetDate}
            >
              Установить дату
            </Button>
          </div>
        </div>
      )}
    </div>,
    document.body
  ) : null;

  return (
    <>
      <button
        ref={triggerRef}
        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-medium hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors whitespace-nowrap"
        onClick={() => { setOpen((p) => !p); setMode("menu"); }}
      >
        <Icon name="Play" size={12} />
        Активировать
        <Icon name="ChevronDown" size={11} />
      </button>
      {menu}
    </>
  );
}
