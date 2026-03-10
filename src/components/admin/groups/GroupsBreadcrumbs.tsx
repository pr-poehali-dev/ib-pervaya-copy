import Icon from "@/components/ui/icon";
import { User } from "@/components/admin/types";

type NavLevel = "groups" | "members" | "member";

interface GroupsBreadcrumbsProps {
  navLevel: NavLevel;
  activeGroup: string | null;
  activeMember: User | null;
  activeGroupMembers: User[];
  onGoGroups: () => void;
  onGoMembers: () => void;
}

export default function GroupsBreadcrumbs({
  navLevel,
  activeGroup,
  activeMember,
  activeGroupMembers,
  onGoGroups,
  onGoMembers,
}: GroupsBreadcrumbsProps) {
  return (
    <div className="flex items-center gap-2 text-sm flex-wrap">
      <button
        onClick={onGoGroups}
        className={`flex items-center gap-1 transition-colors ${navLevel === "groups" ? "text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"}`}
      >
        <Icon name="LayoutGrid" size={14} />
        Группы
      </button>
      {(navLevel === "members" || navLevel === "member") && activeGroup && (
        <>
          <Icon name="ChevronRight" size={14} className="text-muted-foreground" />
          <button
            onClick={onGoMembers}
            className={`flex items-center gap-1 transition-colors ${navLevel === "members" ? "text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Icon name="Users" size={14} />
            {activeGroup}
            {navLevel === "members" && (
              <span className="text-muted-foreground font-normal ml-1">· {activeGroupMembers.length} слушателей</span>
            )}
          </button>
        </>
      )}
      {navLevel === "member" && activeMember && (
        <>
          <Icon name="ChevronRight" size={14} className="text-muted-foreground" />
          <span className="text-foreground font-semibold flex items-center gap-1">
            <Icon name="User" size={14} />
            {activeMember.name}
          </span>
        </>
      )}
    </div>
  );
}
