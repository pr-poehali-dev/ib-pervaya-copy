import { useState, useRef, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import ChatMessageBubble from "@/components/chat/ChatMessageBubble";
import ChatThreadListItem from "@/components/chat/ChatThreadListItem";
import NewThreadModal from "@/components/chat/NewThreadModal";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { getThreadsForStudent } from "@/data/chatMockData";
import { useAuth } from "@/contexts/AuthContext";
import type { ChatThread, ChatMessage, ChatThreadType } from "@/types/chat";

type TabType = "tenant" | "support";

const TAB_LABELS: Record<TabType, string> = {
  tenant:  "К тенанту",
  support: "Техподдержка",
};

export default function ChatStudent() {
  const { user } = useAuth();
  const userEmail = user?.email ?? "student@isp.ru";
  const userName = user ? `${user.firstName} ${user.lastName}` : "Иванов Алексей";

  const [threads, setThreads] = useState<ChatThread[]>(() =>
    getThreadsForStudent(userEmail)
  );
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("tenant");
  const [showNewModal, setShowNewModal] = useState(false);
  const [inputText, setInputText] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);

  const filteredThreads = threads.filter((t) => t.type === activeTab);
  const selectedThread = threads.find((t) => t.id === selectedId) ?? null;

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedThread?.messages.length]);

  // Reset selected thread when tab changes if thread doesn't belong to tab
  useEffect(() => {
    if (selectedThread && selectedThread.type !== activeTab) {
      setSelectedId(null);
    }
  }, [activeTab, selectedThread]);

  function handleSelectThread(id: number) {
    setSelectedId(id);
    setInputText("");
    setAttachedFile(null);
    // Mark as read
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
    if (selectedThread.status === "resolved") return;

    const now = new Date().toISOString();
    const newMsg: ChatMessage = {
      id: Date.now(),
      threadId: selectedThread.id,
      authorId: userEmail,
      authorName: userName,
      authorRole: "student",
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

  function handleReopenThread() {
    if (!selectedThread) return;
    setThreads((prev) =>
      prev.map((t) =>
        t.id === selectedThread.id ? { ...t, status: "in_progress", updatedAt: new Date().toISOString() } : t
      )
    );
  }

  function handleCreate(subject: string, firstMessage: string) {
    const now = new Date().toISOString();
    const newId = Date.now();
    const newThread: ChatThread = {
      id: newId,
      type: activeTab,
      status: "new",
      subject,
      fromUserId: userEmail,
      fromUserName: userName,
      fromUserRole: "student",
      tenantId: 1,
      tenantName: "ООО Нефтехим",
      messages: [
        {
          id: newId + 1,
          threadId: newId,
          authorId: userEmail,
          authorName: userName,
          authorRole: "student",
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

  return (
    <Layout>
      <div className="flex h-[calc(100vh-7rem)] -mx-6 -mt-6 md:-mx-8 md:-mt-8 overflow-hidden rounded-none md:rounded-xl border border-border bg-background shadow-sm">

        {/* ── Левая колонка: список тредов ─────────────────────────────── */}
        <div className="w-80 flex-shrink-0 flex flex-col border-r border-border bg-card">
          {/* Заголовок */}
          <div className="px-4 pt-4 pb-3 border-b border-border">
            <h2 className="text-base font-bold text-foreground">Мои обращения</h2>
          </div>

          {/* Вкладки */}
          <div className="flex border-b border-border">
            {(["tenant", "support"] as TabType[]).map((tab) => {
              const tabUnread = threads
                .filter((t) => t.type === tab)
                .reduce(
                  (sum, t) =>
                    sum + t.messages.filter((m) => m.authorId !== userEmail && !m.isRead).length,
                  0
                );
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "flex-1 py-2.5 text-xs font-semibold transition-colors relative",
                    activeTab === tab
                      ? "text-violet-600 border-b-2 border-violet-600"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {TAB_LABELS[tab]}
                  {tabUnread > 0 && (
                    <span className="ml-1 inline-flex items-center justify-center h-4 min-w-[1rem] px-1 rounded-full bg-red-500 text-white text-[9px] font-bold">
                      {tabUnread}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Кнопка нового обращения */}
          <div className="px-3 py-2.5 border-b border-border">
            <Button
              size="sm"
              onClick={() => setShowNewModal(true)}
              className="w-full gap-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs"
            >
              <Icon name="Plus" size={13} />
              Новое обращение
            </Button>
          </div>

          {/* Список тредов */}
          <div className="flex-1 overflow-y-auto">
            {filteredThreads.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-center px-4">
                <Icon name="MessageCircle" size={24} className="text-muted-foreground/40 mb-2" />
                <p className="text-xs text-muted-foreground">Обращений пока нет</p>
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

        {/* ── Правая колонка: диалог ───────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0">
          {!selectedThread ? (
            /* Плейсхолдер */
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-8">
              <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center">
                <Icon name="MessageCircle" size={28} className="text-muted-foreground/50" />
              </div>
              <p className="font-semibold text-foreground">Выберите обращение</p>
              <p className="text-sm text-muted-foreground max-w-xs">
                Выберите существующее обращение из списка или создайте новое
              </p>
              <Button
                size="sm"
                onClick={() => setShowNewModal(true)}
                className="mt-2 gap-1.5 bg-violet-600 hover:bg-violet-700 text-white"
              >
                <Icon name="Plus" size={13} />
                Новое обращение
              </Button>
            </div>
          ) : (
            <>
              {/* Шапка треда */}
              <div className="flex items-start justify-between gap-4 px-5 py-3.5 border-b border-border bg-card flex-shrink-0">
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm text-foreground leading-snug line-clamp-1">
                    {selectedThread.subject}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {selectedThread.assignedToName
                      ? `Назначено: ${selectedThread.assignedToName}`
                      : selectedThread.type === "support"
                      ? "Техническая поддержка"
                      : selectedThread.tenantName ?? ""}
                  </p>
                </div>
                <StatusBadge status={selectedThread.status} />
              </div>

              {/* Баннер «закрыто» */}
              {selectedThread.status === "resolved" && (
                <div className="flex items-center justify-between gap-3 px-5 py-2.5 bg-emerald-50 dark:bg-emerald-900/20 border-b border-emerald-200 dark:border-emerald-800 flex-shrink-0">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 text-sm">
                    <Icon name="CheckCircle2" size={15} />
                    <span className="font-medium">Обращение закрыто</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleReopenThread}
                    className="text-xs h-7 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30"
                  >
                    Открыть снова
                  </Button>
                </div>
              )}

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

              {/* Форма ввода */}
              {selectedThread.status !== "resolved" && (
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
                      ref={textareaRef}
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Введите сообщение… (Enter — отправить, Shift+Enter — новая строка)"
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
              )}
            </>
          )}
        </div>
      </div>

      {/* Модал нового обращения */}
      {showNewModal && (
        <NewThreadModal
          type={activeTab}
          onClose={() => setShowNewModal(false)}
          onCreate={handleCreate}
        />
      )}
    </Layout>
  );
}

// ── Вспомогательный компонент статуса ─────────────────────────────────────────
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
