import { createContext, useContext, useState, ReactNode } from "react";

interface Stats {
  users: number;
  courses: number;
  assignments: number;
  completed: number;
}

interface StatsContextType {
  stats: Stats;
  setStats: (s: Stats) => void;
}

const StatsContext = createContext<StatsContextType | undefined>(undefined);

export function StatsProvider({ children }: { children: ReactNode }) {
  const [stats, setStats] = useState<Stats>({ users: 0, courses: 6, assignments: 0, completed: 0 });
  return (
    <StatsContext.Provider value={{ stats, setStats }}>
      {children}
    </StatsContext.Provider>
  );
}

export function useStats() {
  const ctx = useContext(StatsContext);
  if (!ctx) throw new Error("useStats must be used within StatsProvider");
  return ctx;
}
