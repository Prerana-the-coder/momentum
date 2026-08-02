import { motion } from "framer-motion";
import { BarChart3, CheckCircle2, Flame, Target, TrendingUp } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { fetchTasks, type Task, type TaskPriority } from "@/lib/tasks-api";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function getDayLabel(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toLocaleDateString("en-US", { weekday: "short" });
}

function getDateString(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------------
// 7-day bar chart (SVG, no external lib)
// ---------------------------------------------------------------------------
function WeeklyBarChart({ tasks }: { tasks: Task[] }) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const daysAgo = 6 - i;
    const dateStr = getDateString(daysAgo);
    const completed = tasks.filter(
      (t) => t.status === "done" && t.updatedAt?.slice(0, 10) === dateStr,
    ).length;
    return { label: getDayLabel(daysAgo), completed, isToday: daysAgo === 0 };
  });

  const maxVal = Math.max(...days.map((d) => d.completed), 1);
  const chartH = 100;

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold">Tasks completed — last 7 days</h3>
      </div>
      <svg width="100%" viewBox={`0 0 280 ${chartH + 28}`} aria-label="7-day completion chart">
        {days.map((day, i) => {
          const barH = day.completed === 0 ? 2 : (day.completed / maxVal) * chartH;
          const x = i * 40 + 4;
          const y = chartH - barH;

          return (
            <g key={i}>
              {/* Bar */}
              <motion.rect
                x={x}
                y={y}
                width={28}
                height={barH}
                rx={4}
                fill={
                  day.isToday
                    ? "hsl(var(--primary))"
                    : day.completed > 0
                      ? "hsl(var(--primary)/0.4)"
                      : "hsl(var(--border))"
                }
                initial={{ height: 0, y: chartH }}
                animate={{ height: barH, y }}
                transition={{ delay: i * 0.06, duration: 0.4, ease: "easeOut" }}
              />
              {/* Count label */}
              {day.completed > 0 && (
                <text
                  x={x + 14}
                  y={y - 4}
                  textAnchor="middle"
                  className="fill-muted-foreground"
                  fontSize={10}
                >
                  {day.completed}
                </text>
              )}
              {/* Day label */}
              <text
                x={x + 14}
                y={chartH + 16}
                textAnchor="middle"
                fontSize={10}
                className={cn(day.isToday ? "fill-primary font-semibold" : "fill-muted-foreground")}
                fill={day.isToday ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"}
              >
                {day.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Priority donut chart
// ---------------------------------------------------------------------------
const PRIORITY_COLORS: Record<TaskPriority, string> = {
  urgent: "hsl(0 72% 56%)",
  high: "hsl(24 85% 52%)",
  medium: "hsl(43 90% 50%)",
  low: "hsl(200 70% 50%)",
};

function PriorityDonut({ tasks }: { tasks: Task[] }) {
  const counts: Record<TaskPriority, number> = {
    urgent: tasks.filter((t) => t.priority === "urgent").length,
    high: tasks.filter((t) => t.priority === "high").length,
    medium: tasks.filter((t) => t.priority === "medium").length,
    low: tasks.filter((t) => t.priority === "low").length,
  };
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  const R = 54;
  const SW = 16;
  const circ = 2 * Math.PI * R;
  let offset = 0;

  const slices = (Object.entries(counts) as [TaskPriority, number][]).map(([priority, count]) => {
    const pct = total === 0 ? 0 : count / total;
    const dash = pct * circ;
    const slice = { priority, count, pct, dash, offset };
    offset += dash;
    return slice;
  });

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center gap-2">
        <Target className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold">Priority distribution</h3>
      </div>
      <div className="flex items-center gap-6">
        <svg width={140} height={140} viewBox="0 0 140 140" aria-label="Priority donut chart">
          {total === 0 ? (
            <circle
              cx={70}
              cy={70}
              r={R}
              fill="none"
              stroke="hsl(var(--border))"
              strokeWidth={SW}
            />
          ) : (
            slices.map((s, i) => (
              <motion.circle
                key={s.priority}
                cx={70}
                cy={70}
                r={R}
                fill="none"
                stroke={PRIORITY_COLORS[s.priority]}
                strokeWidth={SW}
                strokeDasharray={`${s.dash} ${circ - s.dash}`}
                strokeDashoffset={-s.offset + circ / 4}
                strokeLinecap="butt"
                initial={{ strokeDasharray: `0 ${circ}` }}
                animate={{ strokeDasharray: `${s.dash} ${circ - s.dash}` }}
                transition={{ delay: i * 0.1, duration: 0.6, ease: "easeOut" }}
              />
            ))
          )}
          <text x={70} y={66} textAnchor="middle" fontSize={22} fontWeight={600} fill="currentColor">
            {total}
          </text>
          <text x={70} y={82} textAnchor="middle" fontSize={10} fill="hsl(var(--muted-foreground))">
            tasks
          </text>
        </svg>
        <div className="flex flex-col gap-2">
          {(Object.entries(counts) as [TaskPriority, number][]).map(([p, n]) => (
            <div key={p} className="flex items-center gap-2 text-sm">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: PRIORITY_COLORS[p] }}
              />
              <span className="capitalize text-muted-foreground">{p}</span>
              <span className="ml-auto font-semibold tabular-nums">{n}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stat card
// ---------------------------------------------------------------------------
function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color = "text-primary",
}: {
  icon: React.FC<{ className?: string }>;
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className={cn("h-4 w-4", color)} />
        {label}
      </div>
      <p className="mt-2 text-3xl font-semibold tabular-nums">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export function AnalyticsPage() {
  const { accessToken } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!accessToken) return;
    try {
      const data = await fetchTasks(accessToken);
      setTasks(data.tasks);
    } catch {
      // non-blocking
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    load();
  }, [load]);

  const total = tasks.length;
  const done = tasks.filter((t) => t.status === "done").length;
  const completionRate = total === 0 ? 0 : Math.round((done / total) * 100);
  const today = getDateString(0);
  const todayDone = tasks.filter((t) => t.status === "done" && t.updatedAt?.slice(0, 10) === today).length;

  // Streak: count consecutive days (ending today) with at least one completed task
  function calcStreak() {
    let streak = 0;
    for (let i = 0; i < 30; i++) {
      const ds = getDateString(i);
      const hadDone = tasks.some((t) => t.status === "done" && t.updatedAt?.slice(0, 10) === ds);
      if (hadDone) streak++;
      else break;
    }
    return streak;
  }

  const streak = calcStreak();

  if (loading) {
    return (
      <div className="space-y-5">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Analytics</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">Loading your stats…</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Analytics</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Insights from your task activity
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={CheckCircle2} label="Tasks completed" value={done} sub={`of ${total} total`} />
        <StatCard
          icon={TrendingUp}
          label="Completion rate"
          value={`${completionRate}%`}
          sub="all-time"
          color="text-emerald-500"
        />
        <StatCard
          icon={Flame}
          label="Current streak"
          value={streak}
          sub={`day${streak !== 1 ? "s" : ""}`}
          color="text-orange-500"
        />
        <StatCard
          icon={Target}
          label="Completed today"
          value={todayDone}
          sub="tasks done today"
          color="text-violet-500"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-5 lg:grid-cols-2">
        <WeeklyBarChart tasks={tasks} />
        <PriorityDonut tasks={tasks} />
      </div>

      {/* Empty state if no data */}
      {total === 0 && (
        <div className="rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No task data yet — create some tasks to see your analytics.
          </p>
        </div>
      )}
    </div>
  );
}
