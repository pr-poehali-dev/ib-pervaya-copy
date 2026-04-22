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
import { CHAT_THREADS } from "@/data/chatMockData";
import { useAuth } from "@/contexts/AuthContext";
import type { ChatThread, ChatThreadStatus, ChatThreadType } from "@/types/chat";

type TypeFilter = "all" | ChatThreadType;

const TYPE_TABS: { value: TypeFilter; label: string; icon: string }[] = [
  { value: "all",     label: "Все",           icon: "LayoutGrid" },
  { value: "tenant",  label: "К тенанту",     icon: "Building2" },
  { value: "support", label: "Техподдержка",  icon: "Headphones" },
];

export default function ChatSuperAdmin() {
  const { user } = useAuth();
  const userEmail = user?.email ?? "super@isp.ru";
  const userName = user ? `${user.firstName} ${user.lastName}` : "Суперадмин";

  // Суперадмин только наблюдает — state не меняется через канбан,
  // но для корректной работы ThreadDetailModal onStatusChange и onSendMessage тоже нет-опы
  const [threads] = useState<ChatThread[]>(() => [...CHAT_THREADS]);
  const [tenantFilter, setTenantFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");

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

  const filteredThreads = useMemo(() => {
    let result = threads;
    if (tenantFilter !== "all") {
      result = result.filter((t) => String(t.tenantId) === tenantFilter);
    }
    if (typeFilter !== "all") {
      result = result.filter((t) => t.type === typeFilter);
    }
    return result;
  }, [threads, tenantFilter, typeFilter]);

  // Статистика
  const stats = useMemo(() => ({
    total:      threads.length,
    newCount:   threads.filter((t) => t.status === "new").length,
    inProgress: threads.filter((t) => t.status === "in_progress").length,
    resolved:   threads.filter((t) => t.status === "resolved").length,
  }), [threads]);

  // no-op handlers: суперадмин только смотрит
  function handleStatusChange(_threadId: number, _status: ChatThreadStatus) {
    // readonly view — изменения не сохраняются
  }
  function handleSendMessage(_threadId: number, _text: string) {
    // readonly view
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

      {/* Табы типа треда */}
      <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
        {TYPE_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setTypeFilter(tab.value)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors",
              typeFilter === tab.value
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon name={tab.icon} size={12} />
            {tab.label}
          </button>
        ))}
      </div>

      {(tenantFilter !== "all" || typeFilter !== "all") && (
        <button
          type="button"
          onClick={() => { setTenantFilter("all"); setTypeFilter("all"); }}
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
        >
          <Icon name="X" size={13} />
          Сбросить фильтры
        </button>
      )}
    </div>
  );

  return (
    <Layout>
      <div className="space-y-6">
        {/* Шапка */}
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
              <Icon name="LayoutDashboard" size={16} className="text-violet-600 dark:text-violet-400" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Все обращения</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5 pl-10">
            Мониторинг всех обращений платформы
          </p>
        </div>

        {/* Статистика — 4 карточки */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            label="Всего тредов"
            value={stats.total}
            icon="MessageSquare"
            iconBg="bg-violet-100 dark:bg-violet-900/30"
            iconColor="text-violet-600 dark:text-violet-400"
            valueBold
          />
          <StatCard
            label="Новых"
            value={stats.newCount}
            icon="Sparkles"
            iconBg="bg-amber-100 dark:bg-amber-900/30"
            iconColor="text-amber-600 dark:text-amber-400"
            valueColor="text-amber-600 dark:text-amber-400"
          />
          <StatCard
            label="В работе"
            value={stats.inProgress}
            icon="Loader"
            iconBg="bg-blue-100 dark:bg-blue-900/30"
            iconColor="text-blue-600 dark:text-blue-400"
            valueColor="text-blue-600 dark:text-blue-400"
          />
          <StatCard
            label="Решено"
            value={stats.resolved}
            icon="CheckCircle2"
            iconBg="bg-emerald-100 dark:bg-emerald-900/30"
            iconColor="text-emerald-600 dark:text-emerald-400"
            valueColor="text-emerald-600 dark:text-emerald-400"
          />
        </div>

        {/* Канбан (только просмотр) */}
        <KanbanBoard
          threads={filteredThreads}
          currentUserEmail={userEmail}
          currentUserName={userName}
          currentUserRole="superadmin"
          canRespond={false}
          onStatusChange={handleStatusChange}
          onSendMessage={handleSendMessage}
          filterComponent={filterComponent}
        />
      </div>
    </Layout>
  );
}

// ── Карточка статистики ───────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  icon,
  iconBg,
  iconColor,
  valueColor,
  valueBold,
}: {
  label: string;
  value: number;
  icon: string;
  iconBg: string;
  iconColor: string;
  valueColor?: string;
  valueBold?: boolean;
}) {
  return (
    <div className="bg-card border border-border rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm">
      <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0", iconBg)}>
        <Icon name={icon} size={17} className={iconColor} />
      </div>
      <div className="min-w-0">
        <p className={cn("text-xl font-bold leading-none", valueColor ?? "text-foreground", valueBold && "text-foreground")}>
          {value}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5 truncate">{label}</p>
      </div>
    </div>
  );
}

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}
