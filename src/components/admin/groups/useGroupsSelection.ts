import { useState, useRef, useEffect, useCallback } from "react";
import { Group } from "@/types/admin";

export function useGroupsSelection(filteredGroups: Group[]) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [expandedMembers, setExpandedMembers] = useState<Set<number>>(new Set());
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set());
  const [actionsOpen, setActionsOpen] = useState(false);
  const [actionsPos, setActionsPos] = useState({ top: 0, right: 0 });

  const actionsButtonRef = useRef<HTMLButtonElement>(null);
  const actionsMenuRef = useRef<HTMLDivElement>(null);

  const recalcActionsPos = useCallback(() => {
    if (!actionsButtonRef.current) return;
    const r = actionsButtonRef.current.getBoundingClientRect();
    setActionsPos({ top: r.bottom + window.scrollY + 4, right: window.innerWidth - r.right });
  }, []);

  useEffect(() => {
    if (actionsOpen) recalcActionsPos();
  }, [actionsOpen, recalcActionsPos]);

  useEffect(() => {
    if (!actionsOpen) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (
        actionsMenuRef.current && !actionsMenuRef.current.contains(t) &&
        actionsButtonRef.current && !actionsButtonRef.current.contains(t)
      ) setActionsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [actionsOpen]);

  const allChecked = filteredGroups.length > 0 && filteredGroups.every((g) => selectedGroups.has(g.name));
  const someChecked = filteredGroups.some((g) => selectedGroups.has(g.name));

  const toggleSelectAll = () => {
    if (allChecked) {
      setSelectedGroups((prev) => { const next = new Set(prev); filteredGroups.forEach((g) => next.delete(g.name)); return next; });
    } else {
      setSelectedGroups((prev) => { const next = new Set(prev); filteredGroups.forEach((g) => next.add(g.name)); return next; });
    }
  };

  const toggleSelectOne = (group: string) => {
    setSelectedGroups((prev) => { const next = new Set(prev); if (next.has(group)) next.delete(group); else next.add(group); return next; });
  };

  const toggleGroup = (group: string) => {
    setExpandedGroups((prev) => { const next = new Set(prev); if (next.has(group)) next.delete(group); else next.add(group); return next; });
  };

  const toggleMember = (userId: number) => {
    setExpandedMembers((prev) => { const next = new Set(prev); if (next.has(userId)) next.delete(userId); else next.add(userId); return next; });
  };

  return {
    expandedGroups,
    expandedMembers,
    selectedGroups,
    actionsOpen,
    setActionsOpen,
    actionsPos,
    actionsButtonRef,
    actionsMenuRef,
    allChecked,
    someChecked,
    toggleSelectAll,
    toggleSelectOne,
    toggleGroup,
    toggleMember,
  };
}