import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { User, allCourses, gradients, userColors, groups } from "./types";

interface AdminGroupsProps {
  users: User[];
}

export default function AdminGroups({ users }: AdminGroupsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">Назначение курсов сразу для всей группы</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {groups.map((group, idx) => {
          const members = users.filter((u) => u.group === group);
          const activeAssignments = members.reduce((sum, u) => sum + u.assignments.filter((a) => a.active).length, 0);
          return (
            <div key={group} className="bg-card rounded-2xl border border-border p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 bg-gradient-to-br ${gradients[idx % gradients.length]} rounded-xl flex items-center justify-center`}>
                  <Icon name="UsersRound" size={20} className="text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-base">Группа {group}</p>
                  <p className="text-muted-foreground text-xs">{members.length} чел. · {activeAssignments} активных назначений</p>
                </div>
              </div>
              {members.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {members.map((u, i) => (
                    <div key={u.id} title={u.name} className={`w-8 h-8 bg-gradient-to-br ${userColors[i % userColors.length]} rounded-lg flex items-center justify-center`}>
                      <span className="text-white font-bold text-[10px]">{u.initials}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-xs">Нет участников</p>
              )}
              <div className="space-y-1.5">
                {allCourses.slice(0, 3).map((course) => {
                  const assignedCount = members.filter((u) => u.assignments.some((a) => a.courseId === course.id && a.active)).length;
                  return (
                    <div key={course.id} className="flex items-center gap-2 text-sm">
                      <span>{course.emoji}</span>
                      <span className="flex-1 truncate text-xs text-muted-foreground">{course.title}</span>
                      <Badge variant={assignedCount > 0 ? "secondary" : "outline"} className="text-xs">
                        {assignedCount}/{members.length}
                      </Badge>
                    </div>
                  );
                })}
              </div>
              <Button variant="outline" size="sm" className="w-full rounded-xl text-xs" disabled={members.length === 0}>
                <Icon name="Plus" size={14} className="mr-1.5" />
                Назначить курс группе
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
