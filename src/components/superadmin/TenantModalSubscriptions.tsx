import { COURSE_DIRECTIONS } from "@/data/mockData";
import type { TenantType, SubscriptionType } from "@/components/admin/types";
import { SUBSCRIPTION_LABELS as SUB_LABELS } from "@/components/admin/types";

export const DIRECTION_OPTIONS = COURSE_DIRECTIONS.filter((d) => d.id !== 6);

export const SUB_TYPES: SubscriptionType[] = [
  "industrial_safety",
  "energy_safety",
  "labor_protection",
  "expert_pb",
  "expert_gts",
  "own_courses",
];

export const DIR_FOR_SUB: Record<SubscriptionType, number | null> = {
  industrial_safety: 1,
  energy_safety:     2,
  labor_protection:  3,
  expert_pb:         4,
  expert_gts:        5,
  own_courses:       6,
};

interface TenantModalSubscriptionsProps {
  type: TenantType;
  allowedDirs: number[];
  toggleDir: (id: number) => void;
  subLimits: Record<SubscriptionType, number>;
  setLimit: (subType: SubscriptionType, val: string) => void;
  subPrices: Record<SubscriptionType, string>;
  setSubPrice: (subType: SubscriptionType, val: string) => void;
}

export default function TenantModalSubscriptions({
  type,
  allowedDirs,
  toggleDir,
  subLimits,
  setLimit,
  subPrices,
  setSubPrice,
}: TenantModalSubscriptionsProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <p className="text-sm font-medium">Доступ к направлениям и лимиты подписок</p>
        <span className="text-xs text-muted-foreground">(выберите направления и укажите лимит)</span>
      </div>
      <div className="space-y-2">
        {SUB_TYPES.map((subType) => {
          const dirId     = DIR_FOR_SUB[subType];
          const dir       = COURSE_DIRECTIONS.find((d) => d.id === dirId);
          const isOwn     = subType === "own_courses";
          const isAllowed = isOwn
            ? type !== "organization" || allowedDirs.includes(6)
            : allowedDirs.includes(dirId ?? 0);
          return (
            <div key={subType} className={`rounded-xl border transition-colors ${isAllowed ? "border-violet-300 dark:border-violet-700 bg-violet-50/50 dark:bg-violet-900/10" : "border-border bg-muted/20"}`}>
              <label className="flex items-center gap-3 p-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAllowed}
                  onChange={() => toggleDir(dirId ?? 6)}
                  className="rounded accent-violet-600 w-4 h-4 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{SUB_LABELS[subType]}</p>
                  {dir  && <p className="text-xs text-muted-foreground">{dir.courses.length} курсов в направлении</p>}
                  {isOwn && <p className="text-xs text-muted-foreground">Курсы загруженные самим тенантом</p>}
                </div>
                {isAllowed && (
                  <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    <label className="text-xs text-muted-foreground whitespace-nowrap">Цена:</label>
                    <div className="relative">
                      <input
                        type="number" min="0"
                        value={subPrices[subType]}
                        onChange={(e) => setSubPrice(subType, e.target.value)}
                        placeholder="0"
                        className="w-20 h-7 px-2 pr-5 rounded-lg border border-border bg-background text-sm text-center focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                      />
                      <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">₽</span>
                    </div>
                    <label className="text-xs text-muted-foreground whitespace-nowrap">Лимит:</label>
                    <input
                      type="number" min="0"
                      value={subLimits[subType] ?? 0}
                      onChange={(e) => setLimit(subType, e.target.value)}
                      className="w-20 h-7 px-2 rounded-lg border border-border bg-background text-sm text-center focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                    />
                  </div>
                )}
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
}
