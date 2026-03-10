import { createContext, useContext, useState, ReactNode } from "react";

interface Stats {
  subscriptionsLeft: number;
  subscriptionsUsed: number;
  inProgress: number;
  pending: number;
}

interface StatsContextType {
  stats: Stats;
  setStats: (s: Stats) => void;
}

const StatsContext = createContext<StatsContextType | undefined>(undefined);

export function StatsProvider({ children }: { children: ReactNode }) {
  const [stats, setStats] = useState<Stats>({
    subscriptionsLeft: 100,
    subscriptionsUsed: 50,
    inProgress: 10,
    pending: 20,
  });
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
