import Icon from "@/components/ui/icon";
import { gradients, userColors } from "@/components/admin/types";
import { LineItem } from "./SubscriptionReportUtils";

interface GroupSummaryItem {
  group: string;
  count: number;
  items: LineItem[];
  idx: number;
}

interface SubscriptionReportGroupsViewProps {
  groupSummary: GroupSummaryItem[];
  lineItems: LineItem[];
  periodLabel: string;
  expandedGroup: string | null;
  onToggleGroup: (group: string) => void;
}

export default function SubscriptionReportGroupsView({
  groupSummary,
  lineItems,
  periodLabel,
  expandedGroup,
  onToggleGroup,
}: SubscriptionReportGroupsViewProps) {
  return (
    <div className="space-y-3">
      {groupSummary.map((g) => {
        const isOpen = expandedGroup === g.group;
        return (
          <div key={g.group} className="bg-card rounded-2xl border border-border overflow-hidden">
            <button
              className={`w-full flex items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-muted/30 ${isOpen ? "bg-violet-50/50 dark:bg-violet-900/10" : ""}`}
              onClick={() => onToggleGroup(g.group)}
            >
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${gradients[g.idx % gradients.length]} flex items-center justify-center flex-shrink-0`}>
                <Icon name="UsersRound" size={16} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{g.group}</p>
                <p className="text-xs text-muted-foreground">
                  {g.items[0]?.organization ? `${g.items[0].organization} · ` : ""}
                  {new Set(g.items.map(i => i.userId)).size} слушателей
                </p>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0">
                <div className="text-right">
                  <p className="text-xl font-bold text-violet-600 dark:text-violet-400">{g.count}</p>
                  <p className="text-xs text-muted-foreground">назначений</p>
                </div>
                <Icon name={isOpen ? "ChevronUp" : "ChevronDown"} size={16} className="text-muted-foreground" />
              </div>
            </button>

            {isOpen && (
              <div className="border-t border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="px-5 py-2.5 text-left text-xs font-medium text-muted-foreground">Слушатель</th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Курс</th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground whitespace-nowrap">Дата назначения</th>
                    </tr>
                  </thead>
                  <tbody>
                    {g.items.map((item, ii) => (
                      <tr key={`${item.userId}-${item.courseId}`} className={`${ii > 0 ? "border-t border-border/50" : ""} hover:bg-muted/10 transition-colors`}>
                        <td className="px-5 py-2.5">
                          <div className="flex items-center gap-2">
                            <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${userColors[item.userId % userColors.length]} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}>
                              {item.initials}
                            </div>
                            <div>
                              <p className="font-medium text-sm leading-tight">{item.name}</p>
                              <p className="text-xs text-muted-foreground">{item.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-sm text-muted-foreground max-w-[200px]">
                          <span className="block truncate">{item.courseTitle}</span>
                        </td>
                        <td className="px-4 py-2.5 text-sm text-muted-foreground whitespace-nowrap">{item.assignedAt}</td>
                      </tr>
                    ))}
                    <tr className="border-t border-border bg-muted/20">
                      <td colSpan={2} className="px-5 py-2 text-xs font-semibold text-muted-foreground">Итого по {g.group}</td>
                      <td className="px-4 py-2 font-bold text-violet-600 dark:text-violet-400 text-sm">{g.count} назн.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}

      {/* Итого */}
      <div className="flex items-center justify-between bg-gradient-to-r from-violet-600 to-purple-700 rounded-2xl px-6 py-4 text-white">
        <div className="flex items-center gap-2">
          <Icon name="CreditCard" size={18} />
          <span className="font-semibold">ИТОГО назначений за {periodLabel}</span>
        </div>
        <span className="text-2xl font-bold">{lineItems.length}</span>
      </div>
    </div>
  );
}