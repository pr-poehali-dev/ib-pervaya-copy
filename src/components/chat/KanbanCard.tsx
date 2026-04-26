import type { ChatThread } from "@/types/chat";
import Icon from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { formatRelativeTime, ROLE_LABELS } from "@/lib/chatUtils";

interface Props {
  thread: ChatThread;
  onClick: () => void;
  canRespond?: boolean;
}

export default function KanbanCard({ thread, onClick, canRespond = true }: Props) {
  const lastMessage = thread.messages[thread.messages.length - 1];

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left bg-card border border-border rounded-xl p-4 cursor-pointer hover:shadow-md hover:border-violet-200 dark:hover:border-violet-800 transition-all focus:outline-none focus:ring-2 focus:ring-violet-500/40 group"
    >
      {/* Верх: subject + тип треда */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="font-semibold text-sm text-foreground leading-snug line-clamp-2 flex-1 group-hover:text-violet-700 dark:group-hover:text-violet-300 transition-colors">
          {thread.subject}
        </p>
        <span
          className={cn(
            "flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap",
            thread.type === "tenant"
              ? "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300"
              : "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
          )}
        >
          {thread.type === "tenant" ? "К тенанту" : "Техподдержка"}
        </span>
      </div>

      {/* Отправитель + роль */}
      <div className="flex items-center gap-1.5 mb-1.5">
        <Icon name="User" size={11} className="text-muted-foreground flex-shrink-0" />
        <span className="text-xs text-muted-foreground truncate">
          {thread.fromUserName}
        </span>
        <span className="text-[10px] text-muted-foreground/60 bg-muted rounded px-1 py-0.5 flex-shrink-0">
          {ROLE_LABELS[thread.fromUserRole] ?? thread.fromUserRole}
        </span>
      </div>

      {/* Тенант */}
      {thread.tenantName && (
        <div className="flex items-center gap-1.5 mb-2">
          <Icon name="Building2" size={11} className="text-muted-foreground flex-shrink-0" />
          <span className="text-xs text-muted-foreground truncate">{thread.tenantName}</span>
        </div>
      )}

      {/* Последнее сообщение */}
      {lastMessage && (
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3 leading-snug">
          {lastMessage.text ||
            (lastMessage.attachments[0]
              ? `[${lastMessage.attachments[0].name}]`
              : "")}
        </p>
      )}

      {/* Низ: дата + unread + просмотр */}
      <div className="flex items-center justify-between gap-2 mt-auto">
        <span className="text-[11px] text-muted-foreground/70">
          {formatRelativeTime(thread.updatedAt, true)}
        </span>
        <div className="flex items-center gap-1.5">
          {!canRespond && (
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground/60">
              <Icon name="Eye" size={11} />
              просмотр
            </span>
          )}
          {thread.unreadCount > 0 && (
            <span className="inline-flex items-center justify-center h-5 min-w-[1.25rem] px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
              {thread.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
