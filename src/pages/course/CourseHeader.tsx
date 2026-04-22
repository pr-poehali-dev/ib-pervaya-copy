import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";

type CourseHeaderCourse = {
  title?: string;
  code?: string;
  hours?: number;
  hasTest?: boolean;
  dpoAvailable?: boolean;
};

type CourseHeaderDir = {
  title?: string;
};

export function CourseHeader({
  dir,
  course,
  progress,
}: {
  dir: CourseHeaderDir | undefined;
  course: CourseHeaderCourse | undefined;
  progress: number;
}) {
  const title = course?.title ?? "Курс";

  return (
    <div className="bg-card rounded-2xl border border-border px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-purple-700 rounded-xl flex items-center justify-center flex-shrink-0 text-lg">
          🏭
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground leading-none mb-0.5">
                {dir?.title}{course?.code && <span className="font-mono ml-1.5">{course.code}</span>}
              </p>
              <h1 className="font-bold text-sm leading-snug truncate">{title}</h1>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {course?.hours && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Icon name="Clock" size={12} />{course.hours} ч
                </span>
              )}
              {course?.hasTest && (
                <Badge className="bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-xs">Тест</Badge>
              )}
              {course?.dpoAvailable && (
                <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs">ДПО</Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <Progress value={progress} className="h-1 flex-1" />
            <span className="text-xs text-muted-foreground flex-shrink-0">{progress}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
