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
import { CHAT_THREADS } from "@/data/chatMockData";
import { useAuth } from "@/contexts/AuthContext";
import type { ChatThread, ChatThreadStatus, ChatMessage } from "@/types/chat";

export default function ChatSalesManager() {
  const { user } = useAuth();
  const userEmail = user?.email ?? "sales@isp.ru";
  const userName = user ? `${user.firstName} ${user.lastName}` : "Воронов Константин";

  const [threads, setThreads] = useState<ChatThread[]>(() =>
    // В реальности — только треды его тенантов; в моке — все
    [...CHAT_THREADS]
  );
  const [tenantFilter, setTenantFilter] = useState<string>("all");

  // Уникальные тенанты из тредов
  const tenants = useMemo(() => {
    const map = new Map<string, string>();
    threads.forEach((t) => {
      if (t.tenantId != null && t.tenantName) {
        map.set(String(t.tenantId), t.tenantName);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [threads]);

  const filteredThreads = useMemo(
    () =>
      tenantFilter === "all"
        ? threads
        : threads.filter((t) => String(t.tenantId) === tenantFilter),
    [threads, tenantFilter]
  );

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
      authorRole: "sales_manager",
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

  // Статистика
  const totalNew = threads.filter((t) => t.status === "new").length;
  const totalInProgress = threads.filter((t) => t.status === "in_progress").length;
  const totalResolved = threads.filter((t) => t.status === "resolved").length;

  const filterComponent = (
    <div className="flex items-center gap-3">
      <Select value={tenantFilter} onValueChange={setTenantFilter}>
        <SelectTrigger className="w-56 h-9 text-sm">
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
      {tenantFilter !== "all" && (
        <button
          type="button"
          onClick={() => setTenantFilter("all")}
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
            <h1 className="text-2xl font-bold text-foreground">Обращения</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Обращения тенантов вашего портфеля
            </p>
          </div>
          {/* Мини-статистика */}
          <div className="flex items-center gap-3">
            <StatChip label="Новых" value={totalNew} colorClass="text-amber-600 dark:text-amber-400" bgClass="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800" />
            <StatChip label="В работе" value={totalInProgress} colorClass="text-blue-600 dark:text-blue-400" bgClass="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800" />
            <StatChip label="Решено" value={totalResolved} colorClass="text-emerald-600 dark:text-emerald-400" bgClass="bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800" />
          </div>
        </div>

        {/* Канбан */}
        <KanbanBoard
          threads={filteredThreads}
          currentUserEmail={userEmail}
          currentUserName={userName}
          currentUserRole="sales_manager"
          canRespond
          onStatusChange={handleStatusChange}
          onSendMessage={handleSendMessage}
          filterComponent={filterComponent}
        />
      </div>
    </Layout>
  );
}

function StatChip({
  label,
  value,
  colorClass,
  bgClass,
}: {
  label: string;
  value: number;
  colorClass: string;
  bgClass: string;
}) {
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${bgClass}`}>
      <span className={`text-lg font-bold leading-none ${colorClass}`}>{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}
