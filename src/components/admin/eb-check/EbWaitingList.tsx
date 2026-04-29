import { useState } from "react";
import Icon from "@/components/ui/icon";
import { INITIAL_USERS } from "@/data/users";
import { COURSE_DIRECTIONS } from "@/data/courses";
import { CheckProtocol } from "@/data/ebCheckData";
import { User, CourseAssignment } from "@/types/admin";

const EB_COURSE_IDS: number[] = (() => {
  const dir = COURSE_DIRECTIONS.find((d) => d.subscriptionType === "energy_safety");
  return dir ? dir.courses.map((c) => c.id) : [];
})();

type WaitingEntry = {
  user: User;
  assignment: CourseAssignment;
  courseTitle: string;
  status: "waiting" | "in_draft" | "checked";
};

type OrgGroup = {
  orgId: number;
  orgName: string;
  entries: WaitingEntry[];
};

function getStatus(user: User, assignment: CourseAssignment, protocols: CheckProtocol[]): WaitingEntry["status"] {
  const approved = protocols.find(
    (p) => p.status === "approved" && p.candidates.some((c) => c.sdoUserId === user.id)
  );
  if (approved) return "checked";
  const draft = protocols.find(
    (p) => p.status === "draft" && p.candidates.some((c) => c.sdoUserId === user.id)
  );
  if (draft) return "in_draft";
  return "waiting";
}

function StatusBadge({ status }: { status: WaitingEntry["status"] }) {
  if (status === "checked") return (
    <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
      <Icon name="CheckCircle2" size={11} /> Проверен
    </span>
  );
  if (status === "in_draft") return (
    <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
      <Icon name="FileText" size={11} /> В протоколе
    </span>
  );
  return (
    <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
      <Icon name="Clock" size={11} /> Ожидает проверки
    </span>
  );
}

export default function EbWaitingList({
  protocols,
  onCreateCheck,
}: {
  protocols: CheckProtocol[];
  onCreateCheck: (orgId: number, userIds: number[]) => void;
}) {
  const [expandedOrg, setExpandedOrg] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<Record<number, Set<number>>>({});
  const [filterStatus, setFilterStatus] = useState<"all" | "waiting" | "in_draft" | "checked">("all");

  const courseMap: Record<number, string> = {};
  COURSE_DIRECTIONS.find((d) => d.subscriptionType === "energy_safety")
    ?.courses.forEach((c) => { courseMap[c.id] = c.title; });

  // Собираем все записи: пользователи у которых есть завершённые курсы ЭБ с тестом
  const allEntries: WaitingEntry[] = [];
  for (const user of INITIAL_USERS) {
    for (const a of user.assignments) {
      if (
        EB_COURSE_IDS.includes(a.courseId) &&
        (a.status === "completed" || a.status === "certified") &&
        a.testScore !== undefined &&
        a.testScore > 0
      ) {
        allEntries.push({
          user,
          assignment: a,
          courseTitle: courseMap[a.courseId] ?? `Курс ${a.courseId}`,
          status: getStatus(user, a, protocols),
        });
      }
    }
  }

  // Группируем по организациям
  const orgMap: Record<number, OrgGroup> = {};
  for (const entry of allEntries) {
    const orgId = entry.user.clientOrganizationId ?? 0;
    const orgName = entry.user.organization ?? "Без организации";
    if (!orgMap[orgId]) orgMap[orgId] = { orgId, orgName, entries: [] };
    orgMap[orgId].entries.push(entry);
  }
  const groups = Object.values(orgMap);

  function toggleSelect(orgId: number, userId: number) {
    setSelectedIds((prev) => {
      const set = new Set(prev[orgId] ?? []);
      if (set.has(userId)) set.delete(userId); else set.add(userId);
      return { ...prev, [orgId]: set };
    });
  }

  function selectAll(orgId: number, entries: WaitingEntry[]) {
    const waiting = entries.filter((e) => e.status === "waiting").map((e) => e.user.id);
    setSelectedIds((prev) => ({ ...prev, [orgId]: new Set(waiting) }));
  }

  function clearSelected(orgId: number) {
    setSelectedIds((prev) => ({ ...prev, [orgId]: new Set() }));
  }

  const totalWaiting = allEntries.filter((e) => e.status === "waiting").length;
  const totalInDraft = allEntries.filter((e) => e.status === "in_draft").length;
  const totalChecked = allEntries.filter((e) => e.status === "checked").length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-base font-bold">Лист ожидания проверки знаний ЭБ</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Сотрудники, успешно сдавшие тест по курсам энергобезопасности</p>
        </div>
      </div>

      {/* Counters */}
      <div className="grid grid-cols-3 gap-3">
        <button onClick={() => setFilterStatus(filterStatus === "waiting" ? "all" : "waiting")}
          className={`rounded-2xl px-4 py-3 text-center transition-all border ${filterStatus === "waiting" ? "border-amber-400 bg-amber-50" : "bg-card border-border hover:border-amber-300"}`}>
          <div className="text-2xl font-bold text-amber-700">{totalWaiting}</div>
          <div className="text-xs text-amber-600">Ожидают проверки</div>
        </button>
        <button onClick={() => setFilterStatus(filterStatus === "in_draft" ? "all" : "in_draft")}
          className={`rounded-2xl px-4 py-3 text-center transition-all border ${filterStatus === "in_draft" ? "border-blue-400 bg-blue-50" : "bg-card border-border hover:border-blue-300"}`}>
          <div className="text-2xl font-bold text-blue-700">{totalInDraft}</div>
          <div className="text-xs text-blue-600">В протоколах</div>
        </button>
        <button onClick={() => setFilterStatus(filterStatus === "checked" ? "all" : "checked")}
          className={`rounded-2xl px-4 py-3 text-center transition-all border ${filterStatus === "checked" ? "border-emerald-400 bg-emerald-50" : "bg-card border-border hover:border-emerald-300"}`}>
          <div className="text-2xl font-bold text-emerald-700">{totalChecked}</div>
          <div className="text-xs text-emerald-600">Проверены</div>
        </button>
      </div>

      {allEntries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center border border-dashed border-border rounded-2xl">
          <Icon name="UserCheck" size={28} className="text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Нет сотрудников в листе ожидания</p>
            <p className="text-xs text-muted-foreground mt-0.5">Здесь появятся сотрудники, успешно сдавшие тест по курсам ЭБ</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {groups.map((group) => {
            const isExpanded = expandedOrg === group.orgId;
            const selected = selectedIds[group.orgId] ?? new Set<number>();
            const filteredEntries = group.entries.filter((e) => filterStatus === "all" || e.status === filterStatus);
            const waitingCount = group.entries.filter((e) => e.status === "waiting").length;
            const inDraftCount = group.entries.filter((e) => e.status === "in_draft").length;
            const checkedCount = group.entries.filter((e) => e.status === "checked").length;

            if (filteredEntries.length === 0 && filterStatus !== "all") return null;

            return (
              <div key={group.orgId} className={`bg-card border rounded-2xl overflow-hidden transition-all ${isExpanded ? "border-primary/40 shadow-sm" : "border-border"}`}>
                <button
                  className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-muted/20 transition-colors"
                  onClick={() => setExpandedOrg(isExpanded ? null : group.orgId)}
                >
                  <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {group.orgName.replace(/[^А-ЯA-Z]/g, "").slice(0, 2) || group.orgName.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">{group.orgName}</div>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      {waitingCount > 0 && (
                        <span className="text-[10px] font-semibold text-amber-600">{waitingCount} ожидают</span>
                      )}
                      {inDraftCount > 0 && (
                        <span className="text-[10px] font-semibold text-blue-600">{inDraftCount} в протоколе</span>
                      )}
                      {checkedCount > 0 && (
                        <span className="text-[10px] font-semibold text-emerald-600">{checkedCount} проверены</span>
                      )}
                    </div>
                  </div>
                  {waitingCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-bold flex-shrink-0">
                      {waitingCount}
                    </span>
                  )}
                  <Icon name={isExpanded ? "ChevronUp" : "ChevronDown"} size={15} className="text-muted-foreground flex-shrink-0" />
                </button>

                {isExpanded && (
                  <div className="border-t border-border/50">
                    {/* Toolbar */}
                    <div className="flex items-center gap-2 px-5 py-3 bg-muted/30 flex-wrap">
                      <button onClick={() => selectAll(group.orgId, group.entries)}
                        className="text-xs font-medium text-primary hover:text-primary/80 transition-colors">
                        Выбрать всех ожидающих
                      </button>
                      {selected.size > 0 && (
                        <>
                          <span className="text-xs text-muted-foreground">· Выбрано: {selected.size}</span>
                          <button onClick={() => clearSelected(group.orgId)}
                            className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                            Снять выбор
                          </button>
                          <button
                            onClick={() => onCreateCheck(group.orgId, Array.from(selected))}
                            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl gradient-primary text-white text-xs font-semibold hover:opacity-90 transition-opacity">
                            <Icon name="FilePlus2" size={13} />
                            Оформить проверку ({selected.size})
                          </button>
                        </>
                      )}
                      {selected.size === 0 && waitingCount > 0 && (
                        <button
                          onClick={() => onCreateCheck(group.orgId, [])}
                          className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-primary/40 bg-primary/5 text-primary text-xs font-semibold hover:bg-primary/10 transition-colors">
                          <Icon name="FilePlus2" size={13} />
                          Оформить проверку
                        </button>
                      )}
                    </div>

                    {/* Table */}
                    <div className="divide-y divide-border/50">
                      {filteredEntries.map((entry) => {
                        const isSelected = selected.has(entry.user.id);
                        const canSelect = entry.status === "waiting";
                        return (
                          <div key={`${entry.user.id}-${entry.assignment.courseId}`}
                            className={`flex items-center gap-3 px-5 py-3 transition-colors ${canSelect ? "cursor-pointer hover:bg-muted/20" : ""} ${isSelected ? "bg-primary/5" : ""}`}
                            onClick={() => canSelect && toggleSelect(group.orgId, entry.user.id)}
                          >
                            <div className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                              !canSelect ? "border-border/30 bg-muted/30" :
                              isSelected ? "border-primary bg-primary" : "border-border"
                            }`}>
                              {isSelected && <Icon name="Check" size={10} className="text-white" />}
                            </div>

                            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {entry.user.initials}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-semibold truncate">{entry.user.name}</div>
                              <div className="text-xs text-muted-foreground truncate">{entry.courseTitle}</div>
                            </div>

                            <div className="hidden md:flex items-center gap-4 flex-shrink-0">
                              {entry.assignment.testScore !== undefined && (
                                <div className="text-center">
                                  <div className={`text-sm font-bold ${entry.assignment.testScore >= 80 ? "text-emerald-600" : "text-amber-600"}`}>
                                    {entry.assignment.testScore}%
                                  </div>
                                  <div className="text-[10px] text-muted-foreground">результат</div>
                                </div>
                              )}
                              {entry.assignment.testPassedAt && (
                                <div className="text-center">
                                  <div className="text-sm font-semibold">{entry.assignment.testPassedAt}</div>
                                  <div className="text-[10px] text-muted-foreground">дата сдачи</div>
                                </div>
                              )}
                            </div>

                            <StatusBadge status={entry.status} />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
