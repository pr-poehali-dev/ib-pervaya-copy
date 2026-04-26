import { useState, useRef, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import ChatMessageBubble from "@/components/chat/ChatMessageBubble";
import ChatThreadListItem from "@/components/chat/ChatThreadListItem";
import NewThreadModal from "@/components/chat/NewThreadModal";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { getThreadsForTenantAdmin } from "@/data/chatMockData";
import { useAuth } from "@/contexts/AuthContext";
import type { ChatThread, ChatMessage, ChatThreadStatus } from "@/types/chat";
import { ROLE_LABELS } from "@/lib/chatUtils";

type TabType = "incoming" | "support";

export default function ChatTenant() {
  const { user } = useAuth();
  const userEmail = user?.email ?? "admin@isp.ru";
  const userName = user ? `${user.firstName} ${user.lastName}` : "Петрова Мария";
  const userRole = (user?.appRole as string) ?? "admin";
  const tenantId = 1;

  const [threads, setThreads] = useState<ChatThread[]>(() =>
    getThreadsForTenantAdmin(tenantId)
  );
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("incoming");
  const [showNewModal, setShowNewModal] = useState(false);
  const [inputText, setInputText] = useState("");
  const [attachedFile, setAttachedFile] = useState<File | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const incomingThreads = threads.filter((t) => t.type === "tenant");
  const supportThreads = threads.filter((t) => t.type === "support");
  const filteredThreads = activeTab === "incoming" ? incomingThreads : supportThreads;
  const selectedThread = threads.find((t) => t.id === selectedId) ?? null;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedThread?.messages.length]);

  useEffect(() => {
    if (selectedThread) {
      const belongsToTab =
        activeTab === "incoming"
          ? selectedThread.type === "tenant"
          : selectedThread.type === "support";
      if (!belongsToTab) setSelectedId(null);
    }
  }, [activeTab, selectedThread]);

  function handleSelectThread(id: number) {
    setSelectedId(id);
    setInputText("");
    setAttachedFile(null);
    setThreads((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              messages: t.messages.map((m) =>
                m.authorId !== userEmail ? { ...m, isRead: true } : m
              ),
              unreadCount: 0,
            }
          : t
      )
    );
  }

  function handleSend() {
    if (!selectedThread || (!inputText.trim() && !attachedFile)) return;

    const now = new Date().toISOString();
    const newMsg: ChatMessage = {
      id: Date.now(),
      threadId: selectedThread.id,
      authorId: userEmail,
      authorName: userName,
      authorRole: userRole as ChatMessage["authorRole"],
      text: inputText.trim(),
      attachments: attachedFile
        ? [
            {
              id: Date.now() + 1,
              name: attachedFile.name,
              size: attachedFile.size,
              type: attachedFile.type.startsWith("image/") ? "image" : "file",
              url: URL.createObjectURL(attachedFile),
            },
          ]
        : [],
      createdAt: now,
      isRead: false,
    };

    setThreads((prev) =>
      prev.map((t) =>
        t.id === selectedThread.id
          ? { ...t, messages: [...t.messages, newMsg], updatedAt: now }
          : t
      )
    );
    setInputText("");
    setAttachedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function changeStatus(newStatus: ChatThreadStatus) {
    if (!selectedThread) return;
    setThreads((prev) =>
      prev.map((t) =>
        t.id === selectedThread.id
          ? { ...t, status: newStatus, updatedAt: new Date().toISOString() }
          : t
      )
    );
  }

  function handleCreate(subject: string, firstMessage: string) {
    const now = new Date().toISOString();
    const newId = Date.now();
    const newThread: ChatThread = {
      id: newId,
      type: "support",
      status: "new",
      subject,
      fromUserId: userEmail,
      fromUserName: userName,
      fromUserRole: userRole as ChatThread["fromUserRole"],
      tenantId,
      tenantName: "ООО Нефтехим",
      messages: [
        {
          id: newId + 1,
          threadId: newId,
          authorId: userEmail,
          authorName: userName,
          authorRole: userRole as ChatMessage["authorRole"],
          text: firstMessage,
          attachments: [],
          createdAt: now,
          isRead: false,
        },
      ],
      createdAt: now,
      updatedAt: now,
      unreadCount: 0,
    };
    setThreads((prev) => [newThread, ...prev]);
    setSelectedId(newId);
    setShowNewModal(false);
  }

  const incomingUnread = incomingThreads.reduce(
    (sum, t) => sum + t.messages.filter((m) => m.authorId !== userEmail && !m.isRead).length,
    0
  );
  const supportUnread = supportThreads.reduce(
    (sum, t) => sum + t.messages.filter((m) => m.authorId !== userEmail && !m.isRead).length,
    0
  );

  return (
    <Layout>
      <div className="flex h-[calc(100vh-7rem)] -mx-6 -mt-6 md:-mx-8 md:-mt-8 overflow-hidden rounded-none md:rounded-xl border border-border bg-background shadow-sm">

        {/* ── Левая колонка ──────────────────────────────────────────────── */}
        <div className="w-80 flex-shrink-0 flex flex-col border-r border-border bg-card">
          <div className="px-4 pt-4 pb-3 border-b border-border">
            <h2 className="text-base font-bold text-foreground">Чат</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{userName}</p>
          </div>

          {/* Вкладки */}
          <div className="flex border-b border-border">
            <TabButton
              active={activeTab === "incoming"}
              onClick={() => setActiveTab("incoming")}
              unread={incomingUnread}
              label="От слушателей"
            />
            <TabButton
              active={activeTab === "support"}
              onClick={() => setActiveTab("support")}
              unread={supportUnread}
              label="Техподдержка"
            />
          </div>

          {/* Кнопка нового обращения только для вкладки Техподдержка */}
          {activeTab === "support" && (
            <div className="px-3 py-2.5 border-b border-border">
              <Button
                size="sm"
                onClick={() => setShowNewModal(true)}
                className="w-full gap-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs"
              >
                <Icon name="Plus" size={13} />
                Обращение в ТП
              </Button>
            </div>
          )}

          {/* Список тредов */}
          <div className="flex-1 overflow-y-auto">
            {filteredThreads.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-center px-4">
                <Icon name="Inbox" size={24} className="text-muted-foreground/40 mb-2" />
                <p className="text-xs text-muted-foreground">
                  {activeTab === "incoming" ? "Нет входящих обращений" : "Нет обращений в ТП"}
                </p>
              </div>
            ) : (
              filteredThreads.map((t) => (
                <ChatThreadListItem
                  key={t.id}
                  thread={t}
                  isActive={t.id === selectedId}
                  onClick={() => handleSelectThread(t.id)}
                  currentUserEmail={userEmail}
                />
              ))
            )}
          </div>
        </div>

        {/* ── Правая колонка: диалог ─────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0">
          {!selectedThread ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-8">
              <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center">
                <Icon name="MessageSquare" size={28} className="text-muted-foreground/50" />
              </div>
              <p className="font-semibold text-foreground">Выберите обращение</p>
              <p className="text-sm text-muted-foreground max-w-xs">
                Выберите обращение из списка для просмотра переписки
              </p>
            </div>
          ) : (
            <>
              {/* Шапка треда */}
              <div className="px-5 py-3.5 border-b border-border bg-card flex-shrink-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-sm text-foreground leading-snug line-clamp-1 mb-0.5">
                      {selectedThread.subject}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        <Icon name="User" size={11} />
                        {selectedThread.fromUserName}
                        <span className="bg-muted rounded px-1 py-0.5 text-[10px] font-medium ml-0.5">
                          {ROLE_LABELS[selectedThread.fromUserRole] ?? selectedThread.fromUserRole}
                        </span>
                      </span>
                      {selectedThread.tenantName && (
                        <span className="flex items-center gap-1">
                          <Icon name="Building2" size={11} />
                          {selectedThread.tenantName}
                        </span>
                      )}
                      {selectedThread.assignedToName && (
                        <span className="flex items-center gap-1">
                          <Icon name="UserCheck" size={11} />
                          {selectedThread.assignedToName}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <StatusBadge status={selectedThread.status} />
                    {/* Кнопки смены статуса только для входящих от слушателей */}
                    {selectedThread.type === "tenant" && (
                      <>
                        {selectedThread.status === "new" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => changeStatus("in_progress")}
                            className="h-7 text-xs gap-1 border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20"
                          >
                            <Icon name="Play" size={11} />
                            Взять в работу
                          </Button>
                        )}
                        {selectedThread.status === "in_progress" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => changeStatus("resolved")}
                            className="h-7 text-xs gap-1 border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-900/20"
                          >
                            <Icon name="CheckCircle2" size={11} />
                            Закрыть
                          </Button>
                        )}
                        {selectedThread.status === "resolved" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => changeStatus("in_progress")}
                            className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
                          >
                            <Icon name="RotateCcw" size={11} />
                            Переоткрыть
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Сообщения */}
              <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
                {selectedThread.messages.map((msg) => (
                  <ChatMessageBubble
                    key={msg.id}
                    message={msg}
                    isOwn={msg.authorId === userEmail}
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Форма ввода — всегда доступна для admin/manager */}
              <div className="border-t border-border px-4 py-3 bg-card flex-shrink-0">
                {attachedFile && (
                  <div className="flex items-center gap-2 mb-2 px-3 py-1.5 rounded-lg bg-muted text-xs text-muted-foreground">
                    <Icon name="Paperclip" size={12} className="text-violet-500" />
                    <span className="truncate flex-1">{attachedFile.name}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setAttachedFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className="hover:text-foreground"
                    >
                      <Icon name="X" size={12} />
                    </button>
                  </div>
                )}
                <div className="flex items-end gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex-shrink-0"
                    title="Прикрепить файл"
                  >
                    <Icon name="Paperclip" size={17} />
                  </button>
                  <Textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Введите ответ… (Enter — отправить, Shift+Enter — новая строка)"
                    rows={1}
                    className="flex-1 resize-none min-h-[40px] max-h-32 py-2 text-sm"
                  />
                  <Button
                    type="button"
                    onClick={handleSend}
                    disabled={!inputText.trim() && !attachedFile}
                    className="flex-shrink-0 h-10 w-10 p-0 bg-violet-600 hover:bg-violet-700 text-white disabled:opacity-40"
                    size="icon"
                  >
                    <Icon name="Send" size={16} />
                  </Button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => setAttachedFile(e.target.files?.[0] ?? null)}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {showNewModal && (
        <NewThreadModal
          type="support"
          onClose={() => setShowNewModal(false)}
          onCreate={handleCreate}
        />
      )}
    </Layout>
  );
}

// ── Вспомогательные компоненты ────────────────────────────────────────────────

function TabButton({
  active,
  onClick,
  label,
  unread,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  unread: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex-1 py-2.5 text-xs font-semibold transition-colors",
        active
          ? "text-violet-600 border-b-2 border-violet-600"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      {label}
      {unread > 0 && (
        <span className="ml-1 inline-flex items-center justify-center h-4 min-w-[1rem] px-1 rounded-full bg-red-500 text-white text-[9px] font-bold">
          {unread}
        </span>
      )}
    </button>
  );
}

function StatusBadge({ status }: { status: ChatThread["status"] }) {
  const cfg = {
    new:         { label: "Новое",    className: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400" },
    in_progress: { label: "В работе", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400" },
    resolved:    { label: "Решено",   className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400" },
  }[status];

  return (
    <span className={cn("inline-block flex-shrink-0 text-[10px] font-semibold px-2.5 py-1 rounded-full", cfg.className)}>
      {cfg.label}
    </span>
  );
}