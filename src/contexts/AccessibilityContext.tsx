import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type FontSize = "normal" | "large" | "xlarge";
export type LetterSpacing = "normal" | "wide" | "wider";

interface AccessibilitySettings {
  fontSize: FontSize;
  letterSpacing: LetterSpacing;
  highContrast: boolean;
}

interface AccessibilityContextType extends AccessibilitySettings {
  setFontSize: (v: FontSize) => void;
  setLetterSpacing: (v: LetterSpacing) => void;
  setHighContrast: (v: boolean) => void;
  reset: () => void;
  isModified: boolean;
}

const DEFAULT: AccessibilitySettings = {
  fontSize: "normal",
  letterSpacing: "normal",
  highContrast: false,
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

const FONT_SIZE_MAP: Record<FontSize, string> = {
  normal: "16px",
  large:  "19px",
  xlarge: "22px",
};

const LETTER_SPACING_MAP: Record<LetterSpacing, string> = {
  normal: "0em",
  wide:   "0.04em",
  wider:  "0.08em",
};

function apply(settings: AccessibilitySettings) {
  const root = document.documentElement;
  root.style.setProperty("font-size", FONT_SIZE_MAP[settings.fontSize]);
  root.style.setProperty("letter-spacing", LETTER_SPACING_MAP[settings.letterSpacing]);
  if (settings.highContrast) {
    root.classList.add("a11y-contrast");
  } else {
    root.classList.remove("a11y-contrast");
  }
}

function load(): AccessibilitySettings {
  try {
    const raw = localStorage.getItem("a11y");
    if (raw) return { ...DEFAULT, ...JSON.parse(raw) };
  } catch {/* */}
  return { ...DEFAULT };
}

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>(load);

  useEffect(() => {
    apply(settings);
    localStorage.setItem("a11y", JSON.stringify(settings));
  }, [settings]);

  const setFontSize      = (fontSize: FontSize)           => setSettings((s) => ({ ...s, fontSize }));
  const setLetterSpacing = (letterSpacing: LetterSpacing) => setSettings((s) => ({ ...s, letterSpacing }));
  const setHighContrast  = (highContrast: boolean)        => setSettings((s) => ({ ...s, highContrast }));
  const reset            = ()                             => setSettings({ ...DEFAULT });

  const isModified =
    settings.fontSize !== DEFAULT.fontSize ||
    settings.letterSpacing !== DEFAULT.letterSpacing ||
    settings.highContrast !== DEFAULT.highContrast;

  return (
    <AccessibilityContext.Provider value={{ ...settings, setFontSize, setLetterSpacing, setHighContrast, reset, isModified }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) throw new Error("useAccessibility must be used within AccessibilityProvider");
  return ctx;
}
