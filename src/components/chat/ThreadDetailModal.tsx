import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Icon from "@/components/ui/icon";
import ChatMessageBubble from "./ChatMessageBubble";
import { cn } from "@/lib/utils";
import type { ChatThread, ChatThreadStatus } from "@/types/chat";
import { ROLE_LABELS, STATUS_CONFIG } from "@/lib/chatUtils";

interface Props {
  thread: ChatThread;
  onClose: () => void;
  currentUserEmail: string;
  currentUserName: string;
  canRespond: boolean;
  onStatusChange?: (threadId: number, status: ChatThreadStatus) => void;
  onSendMessage?: (threadId: number, text: string) => void;
}



export default function ThreadDetailModal({
  thread,
  onClose,
  currentUserEmail,
  currentUserName,
  canRespond,
  onStatusChange,
  onSendMessage,
}: Props) {
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const statusCfg = STATUS_CONFIG[thread.status];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread.messages.length]);

  function handleSend() {
    if (!inputText.trim() || !onSendMessage) return;
    onSendMessage(thread.id, inputText.trim());
    setInputText("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-2xl w-full p-0 gap-0 max-h-[85vh] flex flex-col overflow-hidden">

        {/* Шапка */}
        <DialogHeader className="px-5 pt-5 pb-4 border-b border-border flex-shrink-0">
          <div className="flex items-start justify-between gap-3 pr-6">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-base font-semibold leading-snug line-clamp-2 mb-2">
                {thread.subject}
              </DialogTitle>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Icon name="User" size={11} />
                  <span>{thread.fromUserName}</span>
                  <span className="bg-muted rounded px-1.5 py-0.5 text-[10px] font-medium">
                    {ROLE_LABELS[thread.fromUserRole] ?? thread.fromUserRole}
                  </span>
                </div>
                {thread.tenantName && (
                  <div className="flex items-center gap-1">
                    <Icon name="Building2" size={11} />
                    <span>{thread.tenantName}</span>
                  </div>
                )}
                {thread.assignedToName && (
                  <div className="flex items-center gap-1">
                    <Icon name="UserCheck" size={11} />
                    <span>{thread.assignedToName}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              <span className={cn("text-[10px] font-semibold px-2.5 py-1 rounded-full", statusCfg.className)}>
                {statusCfg.label}
              </span>
              {/* Кнопки смены статуса */}
              {canRespond && onStatusChange && (
                <div className="flex items-center gap-1.5">
                  {thread.status === "new" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onStatusChange(thread.id, "in_progress")}
                      className="h-7 text-xs gap-1 border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20"
                    >
                      <Icon name="Play" size={11} />
                      Взять в работу
                    </Button>
                  )}
                  {thread.status === "in_progress" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onStatusChange(thread.id, "resolved")}
                      className="h-7 text-xs gap-1 border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-900/20"
                    >
                      <Icon name="CheckCircle2" size={11} />
                      Закрыть
                    </Button>
                  )}
                  {thread.status === "resolved" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onStatusChange(thread.id, "in_progress")}
                      className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
                    >
                      <Icon name="RotateCcw" size={11} />
                      Переоткрыть
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Область сообщений */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3 min-h-0">
          {thread.messages.length === 0 ? (
            <div className="flex items-center justify-center h-20 text-sm text-muted-foreground">
              Сообщений пока нет
            </div>
          ) : (
            thread.messages.map((msg) => (
              <ChatMessageBubble
                key={msg.id}
                message={msg}
                isOwn={msg.authorId === currentUserEmail}
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Форма ответа / баннер «только просмотр» */}
        {canRespond ? (
          <div className="border-t border-border px-4 py-3 bg-card flex-shrink-0">
            <div className="flex items-end gap-2">
              <Textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Введите ответ… (Enter — отправить, Shift+Enter — новая строка)"
                rows={2}
                className="flex-1 resize-none text-sm"
              />
              <Button
                type="button"
                onClick={handleSend}
                disabled={!inputText.trim()}
                size="icon"
                className="h-10 w-10 flex-shrink-0 bg-violet-600 hover:bg-violet-700 text-white disabled:opacity-40"
              >
                <Icon name="Send" size={16} />
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1.5">
              Отвечаете как: <span className="font-medium">{currentUserName}</span>
            </p>
          </div>
        ) : (
          <div className="border-t border-border px-5 py-3 bg-muted/30 flex-shrink-0">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Icon name="Eye" size={15} className="flex-shrink-0" />
              <span>Только просмотр — у вас нет прав на ответ в этом обращении</span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}