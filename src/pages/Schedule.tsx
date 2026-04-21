import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import { INITIAL_USERS, COURSE_DIRECTIONS, GROUPS_DATA } from "@/data/mockData";

// ─── Генерируем расписание из назначений пользователя ────────────────────────

function getWeekDates(offset = 0): Date[] {
  const today = new Date();
  const monday = new Date(today);
  const day = today.getDay() === 0 ? 6 : today.getDay() - 1;
  monday.setDate(today.getDate() - day + offset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

const DAY_NAMES = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const DAY_FULL  = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"];
const MONTHS_RU = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];

interface ScheduleEvent {
  id: number;
  courseId: number;
  courseTitle: string;
  dirTitle: string;
  type: "lesson" | "test" | "webinar" | "deadline";
  dayOfWeek: number;
  time: string;
  duration: string;
  instructor?: string;
  progress: number;
}

function buildSchedule(): ScheduleEvent[] {
  const user = INITIAL_USERS[0];
  const events: ScheduleEvent[] = [];
  let id = 1;

  user.assignments.filter((a) => a.status === "active").forEach((a, idx) => {
    const course = COURSE_DIRECTIONS.flatMap((d) => d.courses).find((c) => c.id === a.courseId);
    const dir    = COURSE_DIRECTIONS.find((d) => d.courses.some((c) => c.id === a.courseId));
    if (!course || !dir) return;

    const baseDay = (idx * 2) % 5;
    events.push({
      id: id++,
      courseId: a.courseId,
      courseTitle: course.title,
      dirTitle: dir.title,
      type: "lesson",
      dayOfWeek: baseDay,
      time: idx % 2 === 0 ? "10:00" : "14:00",
      duration: "2 ч",
      instructor: "Преподаватель УЦ",
      progress: a.progress,
    });

    if (course.hasTest) {
      events.push({
        id: id++,
        courseId: a.courseId,
        courseTitle: course.title,
        dirTitle: dir.title,
        type: "test",
        dayOfWeek: (baseDay + 2) % 5,
        time: "11:00",
        duration: "30 мин",
        progress: a.progress,
      });
    }
  });

  user.assignments.filter((a) => a.status === "pending").forEach((a, idx) => {
    const course = COURSE_DIRECTIONS.flatMap((d) => d.courses).find((c) => c.id === a.courseId);
    const dir    = COURSE_DIRECTIONS.find((d) => d.courses.some((c) => c.id === a.courseId));
    if (!course || !dir) return;

    events.push({
      id: id++,
      courseId: a.courseId,
      courseTitle: course.title,
      dirTitle: dir.title,
      type: "deadline",
      dayOfWeek: (idx + 4) % 7,
      time: "23:59",
      duration: "—",
      progress: 0,
    });
  });

  return events;
}

const EVENT_STYLES: Record<ScheduleEvent["type"], { color: string; bg: string; icon: string; label: string }> = {
  lesson:  { color: "text-violet-700 dark:text-violet-300", bg: "bg-violet-100 dark:bg-violet-900/30 border-violet-200 dark:border-violet-800", icon: "BookOpen",     label: "Занятие"   },
  test:    { color: "text-emerald-700 dark:text-emerald-300", bg: "bg-emerald-100 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800", icon: "ClipboardList", label: "Тест"      },
  webinar: { color: "text-blue-700 dark:text-blue-300", bg: "bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800", icon: "Video",         label: "Вебинар"   },
  deadline:{ color: "text-red-700 dark:text-red-300",  bg: "bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800",   icon: "AlertCircle",  label: "Дедлайн"   },
};

export default function Schedule() {
  const navigate = useNavigate();
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);

  const weekDates  = getWeekDates(weekOffset);
  const allEvents  = buildSchedule();
  const todayIdx   = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;

  const dayEvents  = allEvents.filter((e) => e.dayOfWeek === selectedDay)
    .sort((a, b) => a.time.localeCompare(b.time));

  const group = GROUPS_DATA.find((g) => g.userIds.includes(INITIAL_USERS[0].id));

  const monthYear = weekDates[0].toLocaleDateString("ru-RU", { month: "long", year: "numeric" });

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Заголовок */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-1">Расписание</h1>
            <p className="text-muted-foreground text-sm">
              {group ? `Группа ${group.name} · ${group.clientOrganizationName}` : "Ваше расписание обучения"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setWeekOffset((p) => p - 1)}
              className="p-2 rounded-xl border border-border hover:bg-muted transition-colors"
            >
              <Icon name="ChevronLeft" size={18} />
            </button>
            <button
              onClick={() => setWeekOffset(0)}
              className="px-3 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
            >
              Сегодня
            </button>
            <button
              onClick={() => setWeekOffset((p) => p + 1)}
              className="p-2 rounded-xl border border-border hover:bg-muted transition-colors"
            >
              <Icon name="ChevronRight" size={18} />
            </button>
          </div>
        </div>

        {/* Месяц / год */}
        <p className="text-sm font-semibold text-muted-foreground capitalize">{monthYear}</p>

        {/* Календарь недели */}
        <div className="grid grid-cols-7 gap-1.5">
          {weekDates.map((date, idx) => {
            const isToday   = weekOffset === 0 && idx === todayIdx;
            const isSelected = idx === selectedDay;
            const hasEvents  = allEvents.some((e) => e.dayOfWeek === idx);
            return (
              <button
                key={idx}
                onClick={() => setSelectedDay(idx)}
                className={`flex flex-col items-center py-3 px-2 rounded-2xl transition-all ${
                  isSelected
                    ? "gradient-primary text-white shadow-md"
                    : isToday
                    ? "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300"
                    : "bg-card border border-border hover:border-violet-300 text-foreground"
                }`}
              >
                <span className={`text-xs font-medium mb-1 ${isSelected ? "text-white/80" : "text-muted-foreground"}`}>
                  {DAY_NAMES[idx]}
                </span>
                <span className="text-lg font-bold leading-none">{date.getDate()}</span>
                {hasEvents && (
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${isSelected ? "bg-white/60" : "bg-violet-500"}`} />
                )}
              </button>
            );
          })}
        </div>

        {/* Дата + события */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold">{DAY_FULL[selectedDay]}</h2>
            <span className="text-sm text-muted-foreground">
              {weekDates[selectedDay].getDate()} {MONTHS_RU[weekDates[selectedDay].getMonth()]}
            </span>
            {weekOffset === 0 && selectedDay === todayIdx && (
              <Badge className="bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-xs">Сегодня</Badge>
            )}
          </div>

          {dayEvents.length === 0 ? (
            <div className="bg-card rounded-2xl border border-border p-12 text-center">
              <div className="w-14 h-14 bg-muted/40 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Icon name="CalendarOff" size={24} className="text-muted-foreground" />
              </div>
              <p className="font-semibold">Занятий нет</p>
              <p className="text-sm text-muted-foreground mt-1">В этот день нет запланированных занятий</p>
            </div>
          ) : (
            <div className="space-y-3">
              {dayEvents.map((event) => {
                const style = EVENT_STYLES[event.type];
                return (
                  <div
                    key={event.id}
                    onClick={() => event.type !== "deadline" && navigate(`/course/${event.courseId}`)}
                    className={`bg-card rounded-2xl border p-5 flex items-start gap-4 transition-all ${
                      event.type !== "deadline" ? "cursor-pointer hover:shadow-md" : ""
                    } ${style.bg}`}
                  >
                    <div className="flex-shrink-0 text-center min-w-[52px]">
                      <p className="text-sm font-bold">{event.time}</p>
                      <p className="text-xs text-muted-foreground">{event.duration}</p>
                    </div>

                    <div className="w-px bg-border self-stretch flex-shrink-0" />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon name={style.icon} size={14} className={style.color} />
                        <span className={`text-xs font-semibold ${style.color}`}>{style.label}</span>
                      </div>
                      <p className="font-semibold text-sm leading-snug line-clamp-2">{event.courseTitle}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{event.dirTitle}</p>
                      {event.instructor && (
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <Icon name="User" size={11} />
                          {event.instructor}
                        </p>
                      )}
                      {event.type === "lesson" && event.progress > 0 && (
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex-1 h-1 bg-white/40 dark:bg-black/20 rounded-full overflow-hidden">
                            <div className="h-full bg-violet-600 rounded-full" style={{ width: `${event.progress}%` }} />
                          </div>
                          <span className="text-xs text-muted-foreground">{event.progress}%</span>
                        </div>
                      )}
                    </div>

                    {event.type !== "deadline" && (
                      <Icon name="ChevronRight" size={16} className="text-muted-foreground flex-shrink-0 mt-0.5" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Сводка по неделе */}
        <div className="bg-card rounded-2xl border border-border p-5">
          <h3 className="font-semibold text-sm mb-4">Неделя в цифрах</h3>
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Занятий",  value: allEvents.filter((e) => e.type === "lesson").length,   icon: "BookOpen",     color: "text-violet-600" },
              { label: "Тестов",   value: allEvents.filter((e) => e.type === "test").length,     icon: "ClipboardList",color: "text-emerald-600" },
              { label: "Вебинаров",value: allEvents.filter((e) => e.type === "webinar").length,  icon: "Video",        color: "text-blue-600" },
              { label: "Дедлайнов",value: allEvents.filter((e) => e.type === "deadline").length, icon: "AlertCircle",  color: "text-red-500" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <Icon name={s.icon} size={20} className={`${s.color} mx-auto mb-1`} />
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
