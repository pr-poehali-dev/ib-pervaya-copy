import type { ChatMessage, ChatAttachment } from "@/types/chat";
import Icon from "@/components/ui/icon";
import { cn } from "@/lib/utils";

interface Props {
  message: ChatMessage;
  isOwn: boolean;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  return `${Math.round(bytes / 1024)} KB`;
}

function AttachmentItem({ att, isOwn }: { att: ChatAttachment; isOwn: boolean }) {
  return (
    <button
      type="button"
      onClick={() => window.open(att.url)}
      className={cn(
        "flex items-center gap-2 rounded-lg px-3 py-2 text-xs transition-colors text-left w-full",
        isOwn
          ? "bg-white/20 hover:bg-white/30 text-white"
          : "bg-background border border-border hover:bg-muted/70 text-foreground"
      )}
    >
      <Icon
        name={att.type === "image" ? "Image" : "Paperclip"}
        size={14}
        className={isOwn ? "text-white/80 flex-shrink-0" : "text-muted-foreground flex-shrink-0"}
      />
      <span className="truncate max-w-[180px] font-medium">{att.name}</span>
      <span className={cn("ml-auto flex-shrink-0", isOwn ? "text-white/60" : "text-muted-foreground")}>
        {formatSize(att.size)}
      </span>
    </button>
  );
}

export default function ChatMessageBubble({ message, isOwn }: Props) {
  return (
    <div className={cn("flex flex-col gap-1 max-w-[72%]", isOwn ? "self-end items-end" : "self-start items-start")}>
      {!isOwn && (
        <span className="text-xs font-semibold text-muted-foreground px-1">
          {message.authorName}
        </span>
      )}
      <div
        className={cn(
          "px-4 py-2.5 text-sm leading-relaxed shadow-sm",
          isOwn
            ? "bg-violet-600 text-white rounded-2xl rounded-tr-sm"
            : "bg-muted text-foreground rounded-2xl rounded-tl-sm"
        )}
      >
        {message.text && <p className="whitespace-pre-wrap break-words">{message.text}</p>}

        {message.attachments.length > 0 && (
          <div className={cn("flex flex-col gap-1.5", message.text ? "mt-2" : "")}>
            {message.attachments.map((att) => (
              <AttachmentItem key={att.id} att={att} isOwn={isOwn} />
            ))}
          </div>
        )}

        <p className={cn("text-xs mt-1.5 text-right", isOwn ? "text-white/60" : "text-muted-foreground/70")}>
          {formatTime(message.createdAt)}
        </p>
      </div>
    </div>
  );
}
