import Icon from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import type { TenantCourseStatus } from "@/components/admin/types";

// ─── Типы ─────────────────────────────────────────────────────────────────────

export type PanelTab = "platform" | "tenant_approval";
export type ExpandTab = "materials" | "ntd" | "test";

// ─── Константы ────────────────────────────────────────────────────────────────

export const MAT_META: Record<string, { icon: string; color: string }> = {
  video:        { icon: "Video",        color: "from-rose-500 to-pink-600"     },
  lecture:      { icon: "FileText",     color: "from-violet-500 to-purple-600" },
  presentation: { icon: "Presentation", color: "from-blue-500 to-indigo-600"   },
  audio:        { icon: "Mic",          color: "from-amber-500 to-orange-600"  },
};

export const TEST_MODE_LABELS: Record<string, string> = {
  adaptive: "Адаптивный тренинг",
  section:  "Тест по разделу",
  final:    "Итоговый тест",
};

// ─── Бейдж статуса курса тенанта ─────────────────────────────────────────────

export function ApprovalBadge({ status }: { status: TenantCourseStatus }) {
  const map: Record<TenantCourseStatus, { label: string; cls: string; icon: string }> = {
    draft:            { label: "Черновик",    cls: "bg-muted text-muted-foreground",                                                   icon: "FileText"    },
    pending_approval: { label: "На проверке", cls: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",             icon: "Clock"       },
    approved:         { label: "Одобрен",     cls: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",     icon: "CheckCircle" },
    rejected:         { label: "Отклонён",    cls: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",                    icon: "XCircle"     },
  };
  const { label, cls, icon } = map[status];
  return <Badge className={`text-xs gap-1 ${cls}`}><Icon name={icon} size={11} />{label}</Badge>;
}
