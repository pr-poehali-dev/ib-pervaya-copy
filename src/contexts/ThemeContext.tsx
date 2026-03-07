import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type ThemeId =
  | "light-violet"
  | "light-blue"
  | "light-emerald"
  | "light-rose"
  | "light-amber"
  | "dark-violet"
  | "dark-blue"
  | "dark-emerald"
  | "dark-rose"
  | "dark-amber"
  | "a11y-light"
  | "a11y-dark";

export interface ThemeOption {
  id: ThemeId;
  label: string;
  dark: boolean;
  primary: string;
  preview: string;
}

export const themes: ThemeOption[] = [
  { id: "light-violet", label: "Светлая · Фиолетовый", dark: false, primary: "#7c3aed", preview: "#7c3aed" },
  { id: "light-blue",   label: "Светлая · Синий",      dark: false, primary: "#2563eb", preview: "#2563eb" },
  { id: "light-emerald",label: "Светлая · Изумрудный", dark: false, primary: "#059669", preview: "#059669" },
  { id: "light-rose",   label: "Светлая · Розовый",    dark: false, primary: "#e11d48", preview: "#e11d48" },
  { id: "light-amber",  label: "Светлая · Янтарный",   dark: false, primary: "#d97706", preview: "#d97706" },
  { id: "dark-violet",  label: "Тёмная · Фиолетовый",  dark: true,  primary: "#a78bfa", preview: "#7c3aed" },
  { id: "dark-blue",    label: "Тёмная · Синий",        dark: true,  primary: "#60a5fa", preview: "#2563eb" },
  { id: "dark-emerald", label: "Тёмная · Изумрудный",  dark: true,  primary: "#34d399", preview: "#059669" },
  { id: "dark-rose",    label: "Тёмная · Розовый",      dark: true,  primary: "#fb7185", preview: "#e11d48" },
  { id: "dark-amber",   label: "Тёмная · Янтарный",    dark: true,  primary: "#fbbf24", preview: "#d97706" },
  { id: "a11y-light",  label: "Доступная · Светлая",  dark: false, primary: "#0055cc", preview: "#0055cc" },
  { id: "a11y-dark",   label: "Доступная · Тёмная",   dark: true,  primary: "#4d9fff", preview: "#0055cc" },
];

interface ThemeContextType {
  themeId: ThemeId;
  setTheme: (id: ThemeId) => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const themeVars: Record<ThemeId, Record<string, string>> = {
  "light-violet": {
    "--background": "240 20% 98%", "--foreground": "240 10% 10%",
    "--card": "0 0% 100%", "--card-foreground": "240 10% 10%",
    "--popover": "0 0% 100%", "--popover-foreground": "240 10% 10%",
    "--primary": "258 90% 62%", "--primary-foreground": "0 0% 100%",
    "--secondary": "190 80% 50%", "--secondary-foreground": "0 0% 100%",
    "--muted": "240 10% 95%", "--muted-foreground": "240 5% 50%",
    "--accent": "32 100% 60%", "--accent-foreground": "0 0% 100%",
    "--destructive": "0 84% 60%", "--destructive-foreground": "0 0% 100%",
    "--border": "240 10% 90%", "--input": "240 10% 90%", "--ring": "258 90% 62%",
    "--gradient-from": "258 90% 62%", "--gradient-to": "290 80% 60%",
  },
  "light-blue": {
    "--background": "210 20% 98%", "--foreground": "220 10% 10%",
    "--card": "0 0% 100%", "--card-foreground": "220 10% 10%",
    "--popover": "0 0% 100%", "--popover-foreground": "220 10% 10%",
    "--primary": "221 83% 53%", "--primary-foreground": "0 0% 100%",
    "--secondary": "199 89% 48%", "--secondary-foreground": "0 0% 100%",
    "--muted": "210 10% 95%", "--muted-foreground": "220 5% 50%",
    "--accent": "32 100% 60%", "--accent-foreground": "0 0% 100%",
    "--destructive": "0 84% 60%", "--destructive-foreground": "0 0% 100%",
    "--border": "214 15% 88%", "--input": "214 15% 88%", "--ring": "221 83% 53%",
    "--gradient-from": "221 83% 53%", "--gradient-to": "199 89% 48%",
  },
  "light-emerald": {
    "--background": "150 20% 98%", "--foreground": "160 10% 10%",
    "--card": "0 0% 100%", "--card-foreground": "160 10% 10%",
    "--popover": "0 0% 100%", "--popover-foreground": "160 10% 10%",
    "--primary": "160 84% 39%", "--primary-foreground": "0 0% 100%",
    "--secondary": "172 66% 50%", "--secondary-foreground": "0 0% 100%",
    "--muted": "150 10% 95%", "--muted-foreground": "160 5% 50%",
    "--accent": "32 100% 60%", "--accent-foreground": "0 0% 100%",
    "--destructive": "0 84% 60%", "--destructive-foreground": "0 0% 100%",
    "--border": "150 12% 88%", "--input": "150 12% 88%", "--ring": "160 84% 39%",
    "--gradient-from": "160 84% 39%", "--gradient-to": "172 66% 50%",
  },
  "light-rose": {
    "--background": "340 20% 98%", "--foreground": "340 10% 10%",
    "--card": "0 0% 100%", "--card-foreground": "340 10% 10%",
    "--popover": "0 0% 100%", "--popover-foreground": "340 10% 10%",
    "--primary": "343 80% 50%", "--primary-foreground": "0 0% 100%",
    "--secondary": "316 72% 55%", "--secondary-foreground": "0 0% 100%",
    "--muted": "340 10% 95%", "--muted-foreground": "340 5% 50%",
    "--accent": "32 100% 60%", "--accent-foreground": "0 0% 100%",
    "--destructive": "0 84% 60%", "--destructive-foreground": "0 0% 100%",
    "--border": "340 12% 88%", "--input": "340 12% 88%", "--ring": "343 80% 50%",
    "--gradient-from": "343 80% 50%", "--gradient-to": "316 72% 55%",
  },
  "light-amber": {
    "--background": "45 20% 98%", "--foreground": "30 10% 10%",
    "--card": "0 0% 100%", "--card-foreground": "30 10% 10%",
    "--popover": "0 0% 100%", "--popover-foreground": "30 10% 10%",
    "--primary": "38 92% 50%", "--primary-foreground": "0 0% 100%",
    "--secondary": "25 95% 53%", "--secondary-foreground": "0 0% 100%",
    "--muted": "45 10% 95%", "--muted-foreground": "30 5% 50%",
    "--accent": "160 84% 39%", "--accent-foreground": "0 0% 100%",
    "--destructive": "0 84% 60%", "--destructive-foreground": "0 0% 100%",
    "--border": "40 15% 88%", "--input": "40 15% 88%", "--ring": "38 92% 50%",
    "--gradient-from": "38 92% 50%", "--gradient-to": "25 95% 53%",
  },
  "dark-violet": {
    "--background": "221 39% 11%", "--foreground": "220 20% 92%",
    "--card": "217 33% 17%", "--card-foreground": "220 20% 92%",
    "--popover": "217 33% 17%", "--popover-foreground": "220 20% 92%",
    "--primary": "258 90% 65%", "--primary-foreground": "0 0% 100%",
    "--secondary": "190 80% 45%", "--secondary-foreground": "0 0% 100%",
    "--muted": "217 30% 22%", "--muted-foreground": "220 15% 55%",
    "--accent": "32 100% 55%", "--accent-foreground": "0 0% 100%",
    "--destructive": "0 84% 55%", "--destructive-foreground": "0 0% 100%",
    "--border": "217 25% 24%", "--input": "217 25% 24%", "--ring": "258 90% 65%",
    "--gradient-from": "258 90% 62%", "--gradient-to": "290 80% 60%",
  },
  "dark-blue": {
    "--background": "222 47% 11%", "--foreground": "213 31% 91%",
    "--card": "222 39% 17%", "--card-foreground": "213 31% 91%",
    "--popover": "222 39% 17%", "--popover-foreground": "213 31% 91%",
    "--primary": "213 94% 68%", "--primary-foreground": "0 0% 100%",
    "--secondary": "199 89% 48%", "--secondary-foreground": "0 0% 100%",
    "--muted": "222 30% 22%", "--muted-foreground": "215 20% 55%",
    "--accent": "32 100% 55%", "--accent-foreground": "0 0% 100%",
    "--destructive": "0 84% 55%", "--destructive-foreground": "0 0% 100%",
    "--border": "220 25% 24%", "--input": "220 25% 24%", "--ring": "213 94% 68%",
    "--gradient-from": "221 83% 53%", "--gradient-to": "199 89% 48%",
  },
  "dark-emerald": {
    "--background": "170 30% 10%", "--foreground": "160 20% 90%",
    "--card": "168 28% 16%", "--card-foreground": "160 20% 90%",
    "--popover": "168 28% 16%", "--popover-foreground": "160 20% 90%",
    "--primary": "160 84% 55%", "--primary-foreground": "0 0% 0%",
    "--secondary": "172 66% 50%", "--secondary-foreground": "0 0% 0%",
    "--muted": "168 25% 20%", "--muted-foreground": "160 15% 55%",
    "--accent": "38 92% 50%", "--accent-foreground": "0 0% 100%",
    "--destructive": "0 84% 55%", "--destructive-foreground": "0 0% 100%",
    "--border": "168 22% 23%", "--input": "168 22% 23%", "--ring": "160 84% 55%",
    "--gradient-from": "160 84% 39%", "--gradient-to": "172 66% 45%",
  },
  "dark-rose": {
    "--background": "340 30% 10%", "--foreground": "340 20% 92%",
    "--card": "340 25% 16%", "--card-foreground": "340 20% 92%",
    "--popover": "340 25% 16%", "--popover-foreground": "340 20% 92%",
    "--primary": "343 80% 65%", "--primary-foreground": "0 0% 100%",
    "--secondary": "316 72% 60%", "--secondary-foreground": "0 0% 100%",
    "--muted": "340 22% 20%", "--muted-foreground": "340 12% 55%",
    "--accent": "38 92% 50%", "--accent-foreground": "0 0% 100%",
    "--destructive": "0 84% 55%", "--destructive-foreground": "0 0% 100%",
    "--border": "340 20% 23%", "--input": "340 20% 23%", "--ring": "343 80% 65%",
    "--gradient-from": "343 80% 50%", "--gradient-to": "316 72% 55%",
  },
  "dark-amber": {
    "--background": "25 30% 10%", "--foreground": "40 20% 92%",
    "--card": "25 25% 16%", "--card-foreground": "40 20% 92%",
    "--popover": "25 25% 16%", "--popover-foreground": "40 20% 92%",
    "--primary": "38 92% 60%", "--primary-foreground": "0 0% 0%",
    "--secondary": "25 95% 58%", "--secondary-foreground": "0 0% 0%",
    "--muted": "25 22% 20%", "--muted-foreground": "35 12% 55%",
    "--accent": "160 84% 39%", "--accent-foreground": "0 0% 100%",
    "--destructive": "0 84% 55%", "--destructive-foreground": "0 0% 100%",
    "--border": "25 20% 23%", "--input": "25 20% 23%", "--ring": "38 92% 60%",
    "--gradient-from": "38 92% 50%", "--gradient-to": "25 95% 53%",
  },
  "a11y-light": {
    "--background": "0 0% 100%", "--foreground": "0 0% 7%",
    "--card": "0 0% 98%", "--card-foreground": "0 0% 7%",
    "--popover": "0 0% 100%", "--popover-foreground": "0 0% 7%",
    "--primary": "217 100% 40%", "--primary-foreground": "0 0% 100%",
    "--secondary": "45 100% 45%", "--secondary-foreground": "0 0% 0%",
    "--muted": "0 0% 93%", "--muted-foreground": "0 0% 30%",
    "--accent": "45 100% 45%", "--accent-foreground": "0 0% 0%",
    "--destructive": "0 84% 40%", "--destructive-foreground": "0 0% 100%",
    "--border": "0 0% 80%", "--input": "0 0% 80%", "--ring": "217 100% 40%",
    "--gradient-from": "217 100% 40%", "--gradient-to": "217 100% 28%",
  },
  "a11y-dark": {
    "--background": "0 0% 8%", "--foreground": "0 0% 95%",
    "--card": "0 0% 13%", "--card-foreground": "0 0% 95%",
    "--popover": "0 0% 13%", "--popover-foreground": "0 0% 95%",
    "--primary": "210 100% 65%", "--primary-foreground": "0 0% 0%",
    "--secondary": "45 100% 55%", "--secondary-foreground": "0 0% 0%",
    "--muted": "0 0% 18%", "--muted-foreground": "0 0% 60%",
    "--accent": "45 100% 55%", "--accent-foreground": "0 0% 0%",
    "--destructive": "0 84% 60%", "--destructive-foreground": "0 0% 100%",
    "--border": "0 0% 22%", "--input": "0 0% 22%", "--ring": "210 100% 65%",
    "--gradient-from": "210 100% 55%", "--gradient-to": "210 100% 38%",
  },
};

function applyTheme(id: ThemeId) {
  const root = document.documentElement;
  const vars = themeVars[id];
  const isDark = themes.find((t) => t.id === id)?.dark ?? false;

  Object.entries(vars).forEach(([key, val]) => {
    root.style.setProperty(key, val);
  });

  if (isDark) {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeId] = useState<ThemeId>(() => {
    return (localStorage.getItem("themeId") as ThemeId) || "light-violet";
  });

  useEffect(() => {
    applyTheme(themeId);
    localStorage.setItem("themeId", themeId);
  }, [themeId]);

  const currentTheme = themes.find((t) => t.id === themeId);
  const theme = currentTheme?.dark ? "dark" : "light";

  const toggleTheme = () => {
    const isDark = currentTheme?.dark ?? false;
    const accent = themeId.replace("light-", "").replace("dark-", "");
    const next = isDark ? `light-${accent}` : `dark-${accent}`;
    setThemeId(next as ThemeId);
  };

  return (
    <ThemeContext.Provider value={{ themeId, setTheme: setThemeId, theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}