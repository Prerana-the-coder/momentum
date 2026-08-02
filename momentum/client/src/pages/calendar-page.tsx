import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { fetchTasks, updateTask, type Task, type TaskPriority, type TaskStatus } from "@/lib/tasks-api";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  urgent: "bg-red-500 text-white",
  high: "bg-orange-500 text-white",
  medium: "bg-amber-500 text-white",
  low: "bg-sky-500 text-white",
};

export function CalendarPage() {
  const { accessToken } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const loadTasks = useCallback(async () => {
    if (!accessToken) return;
    try {
      const res = await fetchTasks(accessToken);
      setTasks(res.tasks);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  async function handleToggleStatus(task: Task) {
    if (!accessToken) return;
    const nextStatus: TaskStatus = task.status === "done" ? "todo" : "done";
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t)));
    try {
      await updateTask(accessToken, task.id, { status: nextStatus });
    } catch {
      loadTasks();
    }
  }

  // Calendar math
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonthDays = new Date(year, month, 0).getDate();

  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1));
  }

  function prevMonth() {
    setCurrentDate(new Date(year, month - 1, 1));
  }

  function goToday() {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  }

  function isSameDay(d1: Date, d2: Date) {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  }

  const selectedDateStr = selectedDate.toISOString().slice(0, 10);
  const tasksForSelectedDate = tasks.filter((t) => {
    if (!t.dueDate) return false;
    return t.dueDate.slice(0, 10) === selectedDateStr;
  });

  const unscheduledTasks = tasks.filter((t) => !t.dueDate);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Calendar</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Schedule and track tasks across time
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToday}>
            Today
          </Button>
          <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-2 text-sm font-semibold min-w-[130px] text-center">
              {monthNames[month]} {year}
            </span>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        {/* Main Grid */}
        <div className="lg:col-span-5 rounded-2xl border border-border bg-card p-4 shadow-xs">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="py-1 text-xs font-semibold text-muted-foreground">
                {day}
              </div>
            ))}
          </div>

          {/* Grid Cells */}
          <div className="grid grid-cols-7 gap-1">
            {/* Previous month trailing days */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => {
              const dayNum = prevMonthDays - firstDayOfMonth + i + 1;
              return (
                <div
                  key={`prev-${i}`}
                  className="min-h-[85px] rounded-xl border border-border/40 bg-muted/10 p-1.5 text-xs text-muted-foreground/40"
                >
                  <span className="font-medium">{dayNum}</span>
                </div>
              );
            })}

            {/* Current month days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const cellDate = new Date(year, month, dayNum);
              const isToday = isSameDay(cellDate, new Date());
              const isSelected = isSameDay(cellDate, selectedDate);

              const dateStr = cellDate.toISOString().slice(0, 10);
              const dayTasks = tasks.filter((t) => t.dueDate && t.dueDate.slice(0, 10) === dateStr);

              return (
                <button
                  key={`day-${dayNum}`}
                  onClick={() => setSelectedDate(cellDate)}
                  className={cn(
                    "group relative min-h-[85px] rounded-xl border p-1.5 text-left transition-all flex flex-col justify-between",
                    isSelected
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : isToday
                        ? "border-primary/50 bg-accent/30"
                        : "border-border bg-card hover:bg-accent/40",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                        isToday
                          ? "bg-primary text-primary-foreground font-bold"
                          : isSelected
                            ? "font-bold text-primary"
                            : "text-foreground",
                      )}
                    >
                      {dayNum}
                    </span>
                    {dayTasks.length > 0 && (
                      <span className="text-[10px] font-semibold text-muted-foreground">
                        {dayTasks.length}
                      </span>
                    )}
                  </div>

                  {/* Task pills preview */}
                  <div className="mt-1 space-y-1 overflow-hidden">
                    {dayTasks.slice(0, 2).map((t) => (
                      <div
                        key={t.id}
                        className={cn(
                          "truncate rounded px-1.5 py-0.5 text-[10px] font-medium leading-tight",
                          t.status === "done" ? "line-through opacity-50 bg-muted" : PRIORITY_COLORS[t.priority],
                        )}
                      >
                        {t.title}
                      </div>
                    ))}
                    {dayTasks.length > 2 && (
                      <p className="text-[9px] text-muted-foreground font-medium px-1">
                        +{dayTasks.length - 2} more
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Date Details Panel */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <CalendarIcon className="h-4 w-4 text-primary" />
              <div>
                <h3 className="text-sm font-semibold">
                  {selectedDate.toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  {tasksForSelectedDate.length} task{tasksForSelectedDate.length !== 1 ? "s" : ""} scheduled
                </p>
              </div>
            </div>

            {/* Task list for selected date */}
            <div className="mt-3 space-y-2">
              {loading ? (
                <p className="text-xs text-muted-foreground">Loading tasks...</p>
              ) : tasksForSelectedDate.length === 0 ? (
                <div className="py-6 text-center text-xs text-muted-foreground">
                  No tasks due on this date.
                </div>
              ) : (
                tasksForSelectedDate.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-start gap-2 rounded-xl border border-border bg-muted/20 p-2.5 text-xs"
                  >
                    <button
                      onClick={() => handleToggleStatus(t)}
                      className="mt-0.5 text-muted-foreground hover:text-primary transition-colors"
                    >
                      {t.status === "done" ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : t.status === "in-progress" ? (
                        <Clock className="h-4 w-4 text-amber-500" />
                      ) : (
                        <Circle className="h-4 w-4" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          "font-medium leading-snug",
                          t.status === "done" && "line-through text-muted-foreground",
                        )}
                      >
                        {t.title}
                      </p>
                      <span className="mt-1 inline-block rounded-full bg-muted px-2 py-0.5 text-[10px] capitalize text-muted-foreground font-semibold">
                        {t.priority}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Unscheduled Tasks Section */}
          {unscheduledTasks.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Unscheduled ({unscheduledTasks.length})
              </h4>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {unscheduledTasks.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between rounded-lg border border-border/70 p-2 text-xs"
                  >
                    <span className="truncate font-medium">{t.title}</span>
                    <span className="text-[10px] text-muted-foreground capitalize">{t.priority}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
