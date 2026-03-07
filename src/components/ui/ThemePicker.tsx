import { useTheme, themes, ThemeId } from "@/contexts/ThemeContext";
import Icon from "@/components/ui/icon";

interface ThemePickerProps {
  collapsed: boolean;
  open: boolean;
  onToggle: () => void;
}

const lightThemes = themes.filter((t) => !t.dark && !t.id.startsWith("a11y"));
const darkThemes = themes.filter((t) => t.dark && !t.id.startsWith("a11y"));
const a11yThemes = themes.filter((t) => t.id.startsWith("a11y"));

export default function ThemePicker({ collapsed, open, onToggle }: ThemePickerProps) {
  const { themeId, setTheme, theme } = useTheme();
  const isA11y = themeId.startsWith("a11y");

  return (
    <div className="relative px-2 pb-1">
      <button
        onClick={onToggle}
        title="Выбор темы"
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all ${collapsed ? "justify-center" : ""}`}
      >
        <Icon name={isA11y ? "Accessibility" : theme === "dark" ? "Moon" : "Sun"} size={18} className="flex-shrink-0" />
        {!collapsed && (
          <>
            <span className="text-sm font-medium flex-1 text-left">Тема оформления</span>
            <Icon name={open ? "ChevronUp" : "ChevronDown"} size={14} />
          </>
        )}
      </button>

      {open && !collapsed && (
        <div className="absolute bottom-full left-2 right-2 mb-1 bg-[hsl(220_38%_16%)] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-white/10">
            <p className="text-white/70 text-xs font-semibold uppercase tracking-wide">Светлые</p>
          </div>
          <div className="p-2 grid grid-cols-5 gap-1.5">
            {lightThemes.map((t) => (
              <ThemeButton key={t.id} t={t} active={themeId === t.id} onSelect={setTheme} />
            ))}
          </div>
          <div className="px-4 py-3 border-t border-b border-white/10">
            <p className="text-white/70 text-xs font-semibold uppercase tracking-wide">Тёмные</p>
          </div>
          <div className="p-2 grid grid-cols-5 gap-1.5">
            {darkThemes.map((t) => (
              <ThemeButton key={t.id} t={t} active={themeId === t.id} onSelect={setTheme} />
            ))}
          </div>
          <div className="px-4 py-3 border-t border-b border-white/10 flex items-center gap-2">
            <Icon name="Accessibility" size={13} className="text-white/50" />
            <p className="text-white/70 text-xs font-semibold uppercase tracking-wide">Для дальтоников</p>
          </div>
          <div className="p-2 grid grid-cols-2 gap-1.5">
            {a11yThemes.map((t) => (
              <ThemeButtonWide key={t.id} t={t} active={themeId === t.id} onSelect={setTheme} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ThemeButton({ t, active, onSelect }: { t: typeof themes[0]; active: boolean; onSelect: (id: ThemeId) => void }) {
  const label = t.label.split(" · ")[1];
  return (
    <button
      title={t.label}
      onClick={() => onSelect(t.id)}
      className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all ${active ? "bg-white/20 ring-2 ring-white/50" : "hover:bg-white/10"}`}
    >
      <span
        className="w-6 h-6 rounded-full border-2 border-white/30 flex-shrink-0"
        style={{ background: t.preview }}
      />
      <span className="text-white/60 text-[10px] leading-tight text-center">{label}</span>
    </button>
  );
}

function ThemeButtonWide({ t, active, onSelect }: { t: typeof themes[0]; active: boolean; onSelect: (id: ThemeId) => void }) {
  const label = t.label.split(" · ")[1];
  return (
    <button
      title={t.label}
      onClick={() => onSelect(t.id)}
      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all ${active ? "bg-white/20 ring-2 ring-white/50" : "hover:bg-white/10"}`}
    >
      <span
        className="w-5 h-5 rounded-full border-2 border-white/30 flex-shrink-0"
        style={{ background: t.preview }}
      />
      <span className="text-white/70 text-xs font-medium">{label}</span>
    </button>
  );
}
