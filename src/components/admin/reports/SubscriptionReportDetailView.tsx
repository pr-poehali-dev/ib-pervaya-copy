import { userColors } from "@/components/admin/types";
import { LineItem } from "./SubscriptionReportUtils";

interface SubscriptionReportDetailViewProps {
  lineItems: LineItem[];
}

export default function SubscriptionReportDetailView({ lineItems }: SubscriptionReportDetailViewProps) {
  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="sticky top-0 z-10">
          <tr className="border-b border-border bg-muted/50">
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground w-10">№</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Слушатель</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground whitespace-nowrap">Организация</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Группа</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Курс</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground whitespace-nowrap">Дата назначения</th>
          </tr>
        </thead>
        <tbody>
          {lineItems.map((item, i) => (
            <tr key={`${item.userId}-${item.courseId}-${i}`} className="border-b border-border/60 hover:bg-muted/20 transition-colors">
              <td className="px-4 py-3 text-xs text-muted-foreground">{i + 1}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${userColors[item.userId % userColors.length]} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}>
                    {item.initials}
                  </div>
                  <div>
                    <p className="font-medium leading-tight">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.email}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-muted-foreground max-w-[160px]">
                <span className="block truncate" title={item.organization}>{item.organization || "—"}</span>
              </td>
              <td className="px-4 py-3">
                <span className="px-2.5 py-1 rounded-lg bg-muted text-xs font-medium">{item.group}</span>
              </td>
              <td className="px-4 py-3 text-sm text-muted-foreground max-w-[200px]">
                <span className="block truncate">{item.courseTitle}</span>
              </td>
              <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">{item.assignedAt}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-border bg-muted/30">
            <td colSpan={5} className="px-4 py-3 font-bold text-sm">ИТОГО назначений</td>
            <td className="px-4 py-3 font-bold text-violet-600 dark:text-violet-400 text-base">{lineItems.length}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}