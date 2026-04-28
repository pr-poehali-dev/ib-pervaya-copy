import { useAccessibility, FontSize, LetterSpacing } from "@/contexts/AccessibilityContext";
import Icon from "@/components/ui/icon";

interface Props {
  open: boolean;
  onClose: () => void;
}

const FONT_SIZES: { value: FontSize; label: string; preview: string }[] = [
  { value: "normal", label: "Обычный",  preview: "Аа" },
  { value: "large",  label: "Крупный",  preview: "Аа" },
  { value: "xlarge", label: "Очень крупный", preview: "Аа" },
];

const SPACINGS: { value: LetterSpacing; label: string }[] = [
  { value: "normal", label: "Обычный" },
  { value: "wide",   label: "Широкий" },
  { value: "wider",  label: "Очень широкий" },
];

export default function AccessibilityPanel({ open, onClose }: Props) {
  const { fontSize, letterSpacing, highContrast, setFontSize, setLetterSpacing, setHighContrast, reset, isModified } = useAccessibility();

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border rounded-t-3xl shadow-2xl p-5 space-y-5 md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[400px] md:rounded-2xl md:border">

        {/* Шапка */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
              <Icon name="Accessibility" size={18} className="text-white" />
            </div>
            <div>
              <p className="font-semibold text-sm">Для слабовидящих</p>
              <p className="text-xs text-muted-foreground">Настройки отображения</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground">
            <Icon name="X" size={18} />
          </button>
        </div>

        {/* Размер шрифта */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Размер текста</p>
          <div className="grid grid-cols-3 gap-2">
            {FONT_SIZES.map((f) => (
              <button
                key={f.value}
                onClick={() => setFontSize(f.value)}
                className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 transition-all ${
                  fontSize === f.value
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/40 hover:bg-muted/50"
                }`}
              >
                <span
                  className={`font-bold leading-none ${
                    f.value === "normal" ? "text-base" : f.value === "large" ? "text-xl" : "text-2xl"
                  } ${fontSize === f.value ? "text-primary" : "text-foreground"}`}
                >
                  {f.preview}
                </span>
                <span className="text-[10px] text-muted-foreground leading-none">{f.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Межбуквенный интервал */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Межбуквенный интервал</p>
          <div className="grid grid-cols-3 gap-2">
            {SPACINGS.map((s) => (
              <button
                key={s.value}
                onClick={() => setLetterSpacing(s.value)}
                className={`py-2.5 px-2 rounded-xl border-2 text-xs font-medium transition-all ${
                  letterSpacing === s.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary/40 hover:bg-muted/50 text-muted-foreground"
                }`}
                style={{
                  letterSpacing: s.value === "normal" ? "0" : s.value === "wide" ? "0.04em" : "0.08em",
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Высокий контраст */}
        <div className="flex items-center justify-between p-3.5 rounded-xl border-2 border-border">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${highContrast ? "bg-primary" : "bg-muted"}`}>
              <Icon name="Contrast" size={16} className={highContrast ? "text-primary-foreground" : "text-muted-foreground"} />
            </div>
            <div>
              <p className="text-sm font-medium">Высокий контраст</p>
              <p className="text-xs text-muted-foreground">Чёрно-белое оформление</p>
            </div>
          </div>
          <button
            onClick={() => setHighContrast(!highContrast)}
            className={`relative w-11 h-6 rounded-full transition-colors ${highContrast ? "bg-primary" : "bg-muted"}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${highContrast ? "left-[22px]" : "left-0.5"}`} />
          </button>
        </div>

        {/* Сброс */}
        {isModified && (
          <button
            onClick={reset}
            className="w-full py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all flex items-center justify-center gap-2"
          >
            <Icon name="RotateCcw" size={14} />
            Сбросить настройки
          </button>
        )}
      </div>
    </>
  );
}
