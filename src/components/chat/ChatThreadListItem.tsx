import type { ChatThread, ChatThreadStatus } from "@/types/chat";
import { cn } from "@/lib/utils";

interface Props {
  thread: ChatThread;
  isActive: boolean;
  onClick: () => void;
  currentUserEmail: string;
}

const STATUS_CONFIG: Record<ChatThreadStatus, { label: string; className: string }> = {
  new:         { label: "Новое",    className: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400" },
  in_progress: { label: "В работе", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400" },
  resolved:    { label: "Решено",   className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400" },
};

function formatRelativeTime(iso: string): string {
  const now = new Date();
  const date = new Date(iso);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMin / 60);
  const diffD = Math.floor(diffH / 24);

  if (diffMin < 1) return "только что";
  if (diffMin < 60) return `${diffMin} мин`;
  if (diffH < 24) return `${diffH} ч`;
  if (diffD < 7) return `${diffD} д`;
  return date.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

export default function ChatThreadListItem({ thread, isActive, onClick, currentUserEmail }: Props) {
  const lastMessage = thread.messages[thread.messages.length - 1];
  const statusCfg = STATUS_CONFIG[thread.status];

  const unread = thread.messages.filter(
    (m) => m.authorId !== currentUserEmail && !m.isRead
  ).length;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full text-left px-4 py-3 transition-colors border-l-2 focus:outline-none",
        isActive
          ? "bg-violet-50 dark:bg-violet-900/20 border-l-violet-600"
          : "border-l-transparent hover:bg-muted/50"
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <p className={cn("text-sm font-semibold leading-snug line-clamp-1 flex-1", isActive ? "text-violet-700 dark:text-violet-300" : "text-foreground")}>
          {thread.subject}
        </p>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span className="text-[10px] text-muted-foreground whitespace-nowrap">
            {formatRelativeTime(thread.updatedAt)}
          </span>
          {unread > 0 && (
            <span className="inline-flex items-center justify-center h-4 min-w-[1rem] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
              {unread}
            </span>
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground mb-1.5 truncate">
        {thread.fromUserName}
      </p>

      {lastMessage && (
        <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
          {lastMessage.text || (lastMessage.attachments.length > 0 ? lastMessage.attachments[0].name : "")}
        </p>
      )}

      <span className={cn("inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full", statusCfg.className)}>
        {statusCfg.label}
      </span>
    </button>
  );
}
