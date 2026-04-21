import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { STP_REQUESTS, GROUPS_DATA, COURSE_DIRECTIONS } from "@/data/mockData";
import type { STPRequest, STPRequestStatus, Group } from "@/components/admin/types";

// ─── Бейдж статуса STP-заявки ─────────────────────────────────────────────────

function StatusBadge({ status }: { status: STPRequestStatus }) {
  const map: Record<STPRequestStatus, { label: string; cls: string; icon: string }> = {
    new:         { label: "Новая",          cls: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",       icon: "Inbox" },
    in_progress: { label: "В работе",       cls: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",   icon: "Clock" },
    accepted:    { label: "Принята",        cls: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300", icon: "CheckCircle" },
    rejected:    { label: "Отклонена",      cls: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",           icon: "XCircle" },
  };
  const { label, cls, icon } = map[status];
  return (
    <Badge className={`text-xs gap-1 ${cls}`}>
      <Icon name={icon} size={11} />
      {label}
    </Badge>
  );
}

// ─── Модальное окно детали заявки ─────────────────────────────────────────────

function STPRequestModal({
  request,
  onClose,
  onAccept,
}: {
  request: STPRequest;
  onClose: () => void;
  onAccept: (requestId: number, groupName: string) => void;
}) {
  const dir = COURSE_DIRECTIONS.find((d) => d.id === request.courseDirectionId);
  const [groupName, setGroupName] = useState(
    `${dir?.title?.split(" ")[0] ?? "ОБУ"}-${new Date().getFullYear()}/${String(STP_REQUESTS.length + 1).padStart(2, "0")}`
  );

  const canAccept = request.status === "new" || request.status === "in_progress";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-background rounded-2xl border border-border w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-border flex-shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="font-bold text-base">Заявка {request.externalId}</h2>
              <StatusBadge status={request.status} />
            </div>
            <p className="text-xs text-muted-foreground">Поступила: {request.receivedAt}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted">
            <Icon name="X" size={18} />
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-5">
          {/* Организация и курс */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Организация</p>
              <p className="text-sm font-medium">{request.organizationName}</p>
              {request.inn && <p className="text-xs text-muted-foreground font-mono">ИНН: {request.inn}</p>}
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Курс обучения</p>
              <p className="text-sm font-medium">{request.courseName}</p>
              {dir && <p className="text-xs text-muted-foreground">{dir.title}</p>}
            </div>
          </div>

          {/* Участники */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Участники заявки</p>
              <span className="text-xs font-medium text-muted-foreground">{request.participants.length} чел.</span>
            </div>
            <div className="bg-muted/30 rounded-xl divide-y divide-border">
              {request.participants.map((p, idx) => (
                <div key={idx} className="flex items-center justify-between px-3 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {p.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                    </div>
                    <span className="text-sm font-medium">{p.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{p.email}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Группа */}
          {canAccept && (
            <div className="space-y-2">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Название группы обучения</label>
                <input
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                  placeholder="ПБ-2024/03"
                />
              </div>
              <div className="flex items-start gap-2 px-3 py-2.5 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-xl">
                <Icon name="Info" size={14} className="text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700 dark:text-blue-400">
                  При принятии заявки будет создана группа <strong>«{groupName}»</strong> для организации <strong>{request.organizationName}</strong>.
                  Все участники будут добавлены в группу как слушатели.
                </p>
              </div>
            </div>
          )}

          {/* Созданная группа */}
          {request.status === "accepted" && request.createdGroupId && (
            <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 rounded-xl">
              <Icon name="CheckCircle" size={16} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">Заявка принята в работу</p>
                <p className="text-xs text-emerald-700 dark:text-emerald-400">
                  Принята: {request.acceptedAt} · Группа #{request.createdGroupId}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 p-6 border-t border-border flex-shrink-0">
          <Button variant="outline" className="flex-1 rounded-xl" onClick={onClose}>Закрыть</Button>
          {canAccept && (
            <Button
              className="flex-1 rounded-xl gradient-primary text-white gap-2"
              onClick={() => onAccept(request.id, groupName)}
            >
              <Icon name="CheckCircle" size={15} />
              Принять в работу
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Главная панель STP ───────────────────────────────────────────────────────

export default function STPPanel() {
  const [requests, setRequests] = useState<STPRequest[]>(STP_REQUESTS);
  const [groups, setGroups] = useState<Group[]>(GROUPS_DATA);
  const [selected, setSelected] = useState<STPRequest | null>(null);
  const [statusFilter, setStatusFilter] = useState<STPRequestStatus | "all">("all");
  const [search, setSearch] = useState("");

  const newCount = requests.filter((r) => r.status === "new").length;

  function handleAccept(requestId: number, groupName: string) {
    const request = requests.find((r) => r.id === requestId);
    if (!request) return;

    const newGroupId = Math.max(...groups.map((g) => g.id), 0) + 1;

    const newGroup: Group = {
      id: newGroupId,
      name: groupName,
      tenantId: request.tenantId,
      clientOrganizationName: request.organizationName,
      inn: request.inn,
      status: "forming",
      createdAt: new Date().toLocaleDateString("ru-RU"),
      userIds: [],
      courseIds: request.courseDirectionId ? [request.courseDirectionId * 100 + 1] : [],
      fromStpRequestId: requestId,
    };

    setGroups((prev) => [...prev, newGroup]);
    setRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? { ...r, status: "accepted", acceptedAt: new Date().toLocaleDateString("ru-RU"), createdGroupId: newGroupId }
          : r
      )
    );
    setSelected(null);
  }

  const filtered = requests.filter((r) => {
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    const matchSearch =
      r.organizationName.toLowerCase().includes(search.toLowerCase()) ||
      r.courseName.toLowerCase().includes(search.toLowerCase()) ||
      (r.externalId ?? "").toLowerCase().includes(search.toLowerCase()) ||
      r.participants.some((p) => p.name.toLowerCase().includes(search.toLowerCase()));
    return matchStatus && matchSearch;
  });

  const STATUS_FILTERS: { value: STPRequestStatus | "all"; label: string }[] = [
    { value: "all",         label: "Все"       },
    { value: "new",         label: "Новые"     },
    { value: "in_progress", label: "В работе"  },
    { value: "accepted",    label: "Приняты"   },
    { value: "rejected",    label: "Отклонены" },
  ];

  return (
    <div className="space-y-4">
      {selected && (
        <STPRequestModal
          request={selected}
          onClose={() => setSelected(null)}
          onAccept={handleAccept}
        />
      )}

      {/* Уведомление о новых заявках */}
      {newCount > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-2xl">
          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
            <Icon name="BellRing" size={16} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">
              {newCount} новых заявок из STP Индекс безопасности
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-400">
              Рассмотрите заявки и создайте группы обучения
            </p>
          </div>
          <button
            onClick={() => setStatusFilter("new")}
            className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors flex-shrink-0"
          >
            Показать
          </button>
        </div>
      )}

      {/* Фильтры */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по организации, курсу, участнику..."
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30"
          />
        </div>
        <div className="flex gap-1 bg-muted/40 rounded-xl p-1">
          {STATUS_FILTERS.map(({ value, label }) => {
            const count = value === "all" ? requests.length : requests.filter((r) => r.status === value).length;
            return (
              <button
                key={value}
                onClick={() => setStatusFilter(value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${statusFilter === value ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {label}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${statusFilter === value ? "bg-muted" : "bg-muted/60"}`}>{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Таблица заявок */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Номер</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Организация</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Курс</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Участники</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Поступила</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Статус</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Действие</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((req, idx) => (
                <tr
                  key={req.id}
                  className={`border-b border-border last:border-0 hover:bg-muted/20 transition-colors cursor-pointer ${idx % 2 !== 0 ? "bg-muted/5" : ""} ${req.status === "new" ? "border-l-2 border-l-blue-500" : ""}`}
                  onClick={() => setSelected(req)}
                >
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs text-muted-foreground">{req.externalId ?? `#${req.id}`}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium">{req.organizationName}</p>
                      {req.inn && <p className="text-xs text-muted-foreground font-mono">{req.inn}</p>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm max-w-[220px] truncate" title={req.courseName}>{req.courseName}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Icon name="Users" size={13} className="text-muted-foreground" />
                      <span className="text-sm">{req.participants.length} чел.</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-sm">{req.receivedAt}</td>
                  <td className="px-4 py-3"><StatusBadge status={req.status} /></td>
                  <td className="px-4 py-3">
                    {(req.status === "new" || req.status === "in_progress") ? (
                      <Button
                        size="sm"
                        className="rounded-lg gradient-primary text-white text-xs h-7 px-3"
                        onClick={(e) => { e.stopPropagation(); setSelected(req); }}
                      >
                        Принять в работу
                      </Button>
                    ) : req.status === "accepted" ? (
                      <span className="text-xs text-muted-foreground">
                        Группа создана
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 bg-muted/40 rounded-2xl flex items-center justify-center">
                        <Icon name="Inbox" size={22} className="text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground text-sm">Заявки не найдены</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
