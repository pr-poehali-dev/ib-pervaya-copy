import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface CourseCardProps {
  id: number;
  title: string;
  description: string;
  category: string;
  duration: string;
  lessons: number;
  progress?: number;
  instructor: string;
  color: string;
  emoji: string;
  isEnrolled?: boolean;
}

export default function CourseCard({
  id,
  title,
  description,
  category,
  duration,
  lessons,
  progress,
  instructor,
  color,
  emoji,
  isEnrolled,
}: CourseCardProps) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/lesson/${id}`)}
      className="bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-1 border border-border"
    >
      <div className={`h-36 ${color} flex items-center justify-center relative overflow-hidden`}>
        <span className="text-5xl group-hover:scale-110 transition-transform duration-300">{emoji}</span>
        <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors" />
        {isEnrolled && (
          <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm rounded-full px-2 py-0.5 flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            <span className="text-white text-xs font-medium">В процессе</span>
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <Badge variant="secondary" className="text-xs shrink-0">{category}</Badge>
          <div className="flex items-center gap-1 text-muted-foreground text-xs">
            <Icon name="Clock" size={12} />
            <span>{duration}</span>
          </div>
        </div>

        <h3 className="font-bold text-foreground text-base mb-1 line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-muted-foreground text-sm line-clamp-2 mb-4">{description}</p>

        {isEnrolled && typeof progress === "number" && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Прогресс</span>
              <span className="font-medium text-primary">{progress}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Icon name="BookOpen" size={13} />
            <span>{lessons} уроков</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className="w-5 h-5 bg-muted rounded-full flex items-center justify-center">
              <Icon name="User" size={10} />
            </div>
            <span>{instructor}</span>
          </div>
        </div>
      </div>
    </div>
  );
}