import { useState } from "react";
import Icon from "@/components/ui/icon";
import { TENANT_COURSES } from "@/data/mockData";
import { type PanelTab } from "./PlatformCoursesTypes";
import { PlatformCatalog } from "./PlatformCatalog";
import { TenantApprovalPanel } from "./TenantApprovalPanel";

interface PlatformCoursesPanelProps {
  readOnly?: boolean;
}

export default function PlatformCoursesPanel({ readOnly = false }: PlatformCoursesPanelProps) {
  const [tab, setTab] = useState<PanelTab>("platform");

  const pendingCount = TENANT_COURSES.filter((c) => c.status === "pending_approval").length;

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setTab("platform")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${tab === "platform" ? "gradient-primary text-white border-transparent" : "border-border text-muted-foreground hover:bg-muted/60"}`}
        >
          <Icon name="BookOpen" size={16} />
          Каталог платформы
        </button>
        {!readOnly && (
          <button
            onClick={() => setTab("tenant_approval")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${tab === "tenant_approval" ? "gradient-primary text-white border-transparent" : "border-border text-muted-foreground hover:bg-muted/60"}`}
          >
            <Icon name="ClipboardCheck" size={16} />
            Курсы тенантов
            {pendingCount > 0 && (
              <span className="bg-amber-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {pendingCount}
              </span>
            )}
          </button>
        )}
      </div>

      {tab === "platform"        && <PlatformCatalog readOnly={readOnly} />}
      {tab === "tenant_approval" && !readOnly && <TenantApprovalPanel />}
    </div>
  );
}