import { useState, useMemo } from "react";
import Layout from "@/components/layout/Layout";
import KanbanBoard from "@/components/chat/KanbanBoard";
import Icon from "@/components/ui/icon";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { getThreadsForSupport } from "@/data/chatMockData";
import { useAuth } from "@/contexts/AuthContext";
import type { ChatThread, ChatThreadStatus, ChatMessage } from "@/types/chat";

type StatusFilter = "all" | ChatThreadStatus;

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: "all",         label: "Все" },
  { value: "new",         label: "Новые" },
  { value: "in_progress", label: "В работе" },
  { value: "resolved",    label: "Решено" },
];

export default function ChatSupport() {
  const { user } = useAuth();
  const userEmail = user?.email ?? "support@isp.ru";
  const userName = user ? `${user.firstName} ${user.lastName}` : "Сидорова Елена";

  const [threads, setThreads] = useState<ChatThread[]>(() => getThreadsForSupport());
  const [tenantFilter, setTenantFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  // Уникальные тенанты
  const tenants = useMemo(() => {
    const map = new Map<string, string>();
    threads.forEach((t) => {
      if (t.tenantId != null && t.tenantName) {
        map.set(String(t.tenantId), t.tenantName);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [threads]);

  // Фильтрованные треды для канбана
  const filteredThreads = useMemo(() => {
    let result = threads;
    if (tenantFilter !== "all") {
      result = result.filter((t) => String(t.tenantId) === tenantFilter);
    }
    if (statusFilter !== "all") {
      result = result.filter((t) => t.status === statusFilter);
    }
    return result;
  }, [threads, tenantFilter, statusFilter]);

  // Если выбран конкретный статус — скрывать остальные колонки передаётся через filtered threads:
  // KanbanBoard сам фильтрует по статусу внутри колонок, поэтому пустые колонки покажут placeholder.
  // Для скрытия пустых колонок при фильтре по статусу — передаём visibleStatuses prop через filterComponent slot.

  function handleStatusChange(threadId: number, status: ChatThreadStatus) {
    setThreads((prev) =>
      prev.map((t) =>
        t.id === threadId
          ? { ...t, status, updatedAt: new Date().toISOString() }
          : t
      )
    );
  }

  function handleSendMessage(threadId: number, text: string) {
    const now = new Date().toISOString();
    const newMsg: ChatMessage = {
      id: Date.now(),
      threadId,
      authorId: userEmail,
      authorName: userName,
      authorRole: "support",
      text,
      attachments: [],
      createdAt: now,
      isRead: false,
    };
    setThreads((prev) =>
      prev.map((t) =>
        t.id === threadId
          ? { ...t, messages: [...t.messages, newMsg], updatedAt: now }
          : t
      )
    );
  }

  // Считаем непрочитанные в каждом статусе для таб-бейджей
  function unreadForStatus(s: StatusFilter): number {
    const base = s === "all" ? threads : threads.filter((t) => t.status === s);
    return base.reduce(
      (sum, t) =>
        sum + t.messages.filter((m) => m.authorId !== userEmail && !m.isRead).length,
      0
    );
  }

  const filterComponent = (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Фильтр по тенанту */}
      <Select value={tenantFilter} onValueChange={setTenantFilter}>
        <SelectTrigger className="w-52 h-9 text-sm">
          <SelectValue placeholder="Все тенанты" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Все тенанты</SelectItem>
          {tenants.map((t) => (
            <SelectItem key={t.id} value={t.id}>
              {t.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Табы статусов */}
      <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
        {STATUS_TABS.map((tab) => {
          const unread = unreadForStatus(tab.value);
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => setStatusFilter(tab.value)}
              className={cn(
                "flex items-center gap-1 px-3 py-1 rounded-md text-xs font-medium transition-colors",
                statusFilter === tab.value
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
              {unread > 0 && (
                <span className="inline-flex items-center justify-center h-4 min-w-[1rem] px-1 rounded-full bg-red-500 text-white text-[9px] font-bold">
                  {unread}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {(tenantFilter !== "all" || statusFilter !== "all") && (
        <button
          type="button"
          onClick={() => { setTenantFilter("all"); setStatusFilter("all"); }}
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
        >
          <Icon name="X" size={13} />
          Сбросить
        </button>
      )}
    </div>
  );

  return (
    <Layout>
      <div className="space-y-6">
        {/* Шапка */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Icon name="Headphones" size={16} className="text-blue-600 dark:text-blue-400" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Техническая поддержка</h1>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5 pl-10">
              Входящие обращения
            </p>
          </div>

          {/* Счётчики */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Всего:</span>
            <span className="font-bold text-foreground">{threads.length}</span>
            <span className="text-muted-foreground ml-2">Непрочитанных:</span>
            <span className="font-bold text-red-500">{unreadForStatus("all")}</span>
          </div>
        </div>

        {/* Канбан */}
        <KanbanBoard
          threads={filteredThreads}
          currentUserEmail={userEmail}
          currentUserName={userName}
          currentUserRole="support"
          canRespond
          onStatusChange={handleStatusChange}
          onSendMessage={handleSendMessage}
          filterComponent={filterComponent}
        />
      </div>
    </Layout>
  );
}
