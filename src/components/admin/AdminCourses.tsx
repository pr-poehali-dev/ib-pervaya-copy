import { Badge } from "@/components/ui/badge";
import { User, allCourses, gradients, userColors } from "./types";

interface AdminCoursesProps {
  users: User[];
}

export default function AdminCourses({ users }: AdminCoursesProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {allCourses.map((course, idx) => {
        const enrolled = users.filter((u) =>
          u.assignments.some((a) => a.courseId === course.id && a.active)
        );
        const completed = users.filter((u) =>
          u.assignments.some((a) => a.courseId === course.id && a.progress === 100)
        );
        const avgProgress =
          enrolled.length > 0
            ? Math.round(
                enrolled.reduce((sum, u) => {
                  const a = u.assignments.find((a) => a.courseId === course.id);
                  return sum + (a?.progress ?? 0);
                }, 0) / enrolled.length
              )
            : 0;

        return (
          <div key={course.id} className="bg-card rounded-2xl border border-border p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-11 h-11 bg-gradient-to-br ${gradients[idx]} rounded-xl flex items-center justify-center text-xl`}
              >
                {course.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm leading-tight truncate">{course.title}</p>
                <Badge variant="secondary" className="text-xs mt-0.5">{course.category}</Badge>
              </div>
            </div>

            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Слушателей</span>
                <span className="font-medium text-foreground">{enrolled.length}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Завершили</span>
                <span className="font-medium text-foreground">{completed.length}</span>
              </div>
            </div>

            {enrolled.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {enrolled.map((u, i) => (
                  <div
                    key={u.id}
                    title={u.name}
                    className={`w-7 h-7 bg-gradient-to-br ${userColors[i % userColors.length]} rounded-lg flex items-center justify-center`}
                  >
                    <span className="text-white font-bold text-[10px]">{u.initials}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}