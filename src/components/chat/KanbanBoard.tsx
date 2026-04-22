import { useState } from "react";
import type { ChatThread, ChatThreadStatus, ChatMessage } from "@/types/chat";
import KanbanCard from "./KanbanCard";
import ThreadDetailModal from "./ThreadDetailModal";
import Icon from "@/components/ui/icon";
import { cn } from "@/lib/utils";

interface Props {
  threads: ChatThread[];
  currentUserEmail: string;
  currentUserName: string;
  currentUserRole?: ChatMessage["authorRole"];
  canRespond: boolean;
  onStatusChange: (threadId: number, status: ChatThreadStatus) => void;
  onSendMessage: (threadId: number, text: string) => void;
  title?: string;
  filterComponent?: React.ReactNode;
}

interface ColumnConfig {
  status: ChatThreadStatus;
  label: string;
  icon: string;
  headerClass: string;
  countClass: string;
  emptyIcon: string;
}

const COLUMNS: ColumnConfig[] = [
  {
    status: "new",
    label: "Новые",
    icon: "Sparkles",
    headerClass: "text-amber-600 dark:text-amber-400",
    countClass: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
    emptyIcon: "InboxIcon",
  },
  {
    status: "in_progress",
    label: "В работе",
    icon: "Loader",
    headerClass: "text-blue-600 dark:text-blue-400",
    countClass: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
    emptyIcon: "Clock",
  },
  {
    status: "resolved",
    label: "Решено",
    icon: "CheckCircle2",
    headerClass: "text-emerald-600 dark:text-emerald-400",
    countClass: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
    emptyIcon: "CheckCheck",
  },
];

export default function KanbanBoard({
  threads,
  currentUserEmail,
  currentUserName,
  currentUserRole,
  canRespond,
  onStatusChange,
  onSendMessage,
  filterComponent,
}: Props) {
  const [openThreadId, setOpenThreadId] = useState<number | null>(null);

  const openThread = threads.find((t) => t.id === openThreadId) ?? null;

  // Inject new messages into a local view when onSendMessage is called through the modal
  // The actual state is managed by the parent; we just pass the handlers through.

  return (
    <div className="flex flex-col gap-4 min-h-0">
      {/* Фильтры */}
      {filterComponent && (
        <div className="flex-shrink-0">
          {filterComponent}
        </div>
      )}

      {/* Колонки */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-0" style={{ minWidth: "860px" }}>
          {COLUMNS.map((col) => {
            const colThreads = threads.filter((t) => t.status === col.status);
            return (
              <div
                key={col.status}
                className="flex-1 min-w-[280px] max-w-[400px] flex flex-col gap-0"
              >
                {/* Заголовок колонки */}
                <div className="flex items-center gap-2 mb-3 px-1">
                  <Icon
                    name={col.icon}
                    size={15}
                    className={col.headerClass}
                  />
                  <span className={cn("text-sm font-semibold", col.headerClass)}>
                    {col.label}
                  </span>
                  <span
                    className={cn(
                      "ml-auto inline-flex items-center justify-center h-5 min-w-[1.25rem] px-1.5 rounded-full text-[11px] font-bold",
                      col.countClass
                    )}
                  >
                    {colThreads.length}
                  </span>
                </div>

                {/* Карточки */}
                <div className="flex flex-col gap-3">
                  {colThreads.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/20 py-10 text-center">
                      <Icon
                        name={col.emptyIcon}
                        size={22}
                        className="text-muted-foreground/30"
                      />
                      <p className="text-xs text-muted-foreground/60">Нет обращений</p>
                    </div>
                  ) : (
                    colThreads.map((thread) => (
                      <KanbanCard
                        key={thread.id}
                        thread={thread}
                        onClick={() => setOpenThreadId(thread.id)}
                        canRespond={canRespond}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Модал просмотра треда */}
      {openThread && (
        <ThreadDetailModal
          thread={openThread}
          onClose={() => setOpenThreadId(null)}
          currentUserEmail={currentUserEmail}
          currentUserName={currentUserName}
          canRespond={canRespond}
          onStatusChange={(threadId, status) => {
            onStatusChange(threadId, status);
          }}
          onSendMessage={(threadId, text) => {
            onSendMessage(threadId, text);
          }}
        />
      )}
    </div>
  );
}
