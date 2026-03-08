import { createContext, useContext, useState, ReactNode } from "react";

export type AppRole =
  | "superadmin"
  | "sales_manager"
  | "admin"
  | "manager"
  | "student";

export type TenantType = "training_center" | "organization";

export interface RoleContextValue {
  role: AppRole;
  setRole: (r: AppRole) => void;
  tenantType: TenantType;
  setTenantType: (t: TenantType) => void;
  canOwnCourses: boolean;
  setCanOwnCourses: (v: boolean) => void;
}

const RoleContext = createContext<RoleContextValue | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<AppRole>("admin");
  const [tenantType, setTenantType] = useState<TenantType>("training_center");
  const [canOwnCourses, setCanOwnCourses] = useState(false);

  return (
    <RoleContext.Provider value={{ role, setRole, tenantType, setTenantType, canOwnCourses, setCanOwnCourses }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole(): RoleContextValue {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used inside RoleProvider");
  return ctx;
}
