import { createContext, useContext, useState, ReactNode } from "react";
import { BrandingSettings } from "@/components/admin/settings/types";

interface BrandingContextValue {
  branding: BrandingSettings;
  setBranding: (b: BrandingSettings) => void;
}

const BrandingContext = createContext<BrandingContextValue | null>(null);

export function BrandingProvider({ children }: { children: ReactNode }) {
  const [branding, setBranding] = useState<BrandingSettings>({ logoUrl: null, customDomain: "i-sdo.ru" });
  return (
    <BrandingContext.Provider value={{ branding, setBranding }}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  const ctx = useContext(BrandingContext);
  if (!ctx) throw new Error("useBranding must be used within BrandingProvider");
  return ctx;
}