import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  ListTodo,
  Plus,
  Sparkles,
  Timer,
  TrendingUp,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/auth-context";
import { fetchHealth, type HealthStatus } from "@/lib/api";
import { createTask, fetchTasks, updateTask, type Task, type TaskStatus } from "@/lib/tasks-api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function DashboardPage() {
  const { user, accessToken } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);

  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);
  const [healthLoading, setHealthLoading] = useState(true);

  const [quickTitle, setQuickTitle] = useState("");
  const [creating, setCreating] = useState(false);

  const loadTasks = useCallback(async () => {
    if (!accessToken) {
      setTasksLoading(false);
      return;
    }
    try {
      const res = await fetchTasks(accessToken);
      setTasks(res.tasks);
    } catch {
      // ignore
    } finally {
      setTasksLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  useEffect(() => {
    let active = true;
    fetchHealth()
      .then((data) => {
        if (active) setHealth(data);
      })
      .catch((err: unknown) => {
        if (!active) return;
        setHealthError(err instanceof Error ? err.message : "Unable to reach API");
      })
      .finally(() => {
        if (active) setHealthLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function handleQuickAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!quickTitle.trim() || !accessToken) return;
    setCreating(true);
    try {
      const res = await createTask(accessToken, { title: quickTitle.trim(), status: "todo" });
      setTasks((prev) => [res.task, ...prev]);
      setQuickTitle("");
    } catch {
      // ignore
    } finally {
      setCreating(false);
    }
  }

  async function toggleStatus(task: Task) {
    if (!accessToken) return;
    const nextStatus: TaskStatus = task.status === "done" ? "todo" : "done";
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t)));
    try {
      await updateTask(accessToken, task.id, { status: nextStatus });
    } catch {
      loadTasks();
    }
  }

  const total = tasks.length;
  const done = tasks.filter((t) => t.status === "done").length;
  const inProgress = tasks.filter((t) => t.status === "in-progress").length;
  const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;
  const recentTasks = tasks.slice(0, 5);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            {getGreeting()}, {user?.name.split(" ")[0] || "Friend"} 👋
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Here is your daily momentum overview.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild size="sm">
            <Link to="/app/tasks">
              <ListTodo className="h-4 w-4" />
              Open Tasks Board
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/app/focus">
              <Timer className="h-4 w-4" />
              Start Focus
            </Link>
          </Button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wide">Tasks Completed</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-3 text-3xl font-bold">{tasksLoading ? "—" : `${done} / ${total}`}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {inProgress} task{inProgress !== 1 ? "s" : ""} currently in progress
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wide">Completion Rate</span>
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-3 text-3xl font-bold">{tasksLoading ? "—" : `${completionRate}%`}</p>
          <div className="mt-2 h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wide">Focus Session</span>
            <Sparkles className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-3 text-3xl font-bold">25 min</p>
          <p className="mt-1 text-xs text-muted-foreground">Standard Pomodoro interval</p>
        </div>
      </div>

      {/* Quick Add & Recent Tasks */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Tasks */}
        <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-5">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold">Today&apos;s Focus Tasks</h3>
              <Link
                to="/app/tasks"
                className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
              >
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {/* Quick Add Form */}
            <form onSubmit={handleQuickAdd} className="mb-4 flex gap-2">
              <input
                value={quickTitle}
                onChange={(e) => setQuickTitle(e.target.value)}
                placeholder="Quick add a new task..."
                className="flex-1 rounded-lg border border-input bg-background px-3 py-1.5 text-sm outline-none ring-ring focus:ring-2 placeholder:text-muted-foreground/60"
              />
              <Button type="submit" size="sm" disabled={!quickTitle.trim() || creating}>
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </form>

            {tasksLoading ? (
              <div className="space-y-3 py-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : recentTasks.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border py-8 text-center text-xs text-muted-foreground">
                No tasks added yet. Add one above!
              </div>
            ) : (
              <ul className="space-y-2">
                {recentTasks.map((t) => (
                  <motion.li
                    key={t.id}
                    layout
                    className="flex items-center justify-between rounded-lg border border-border/80 bg-muted/20 px-3 py-2 text-sm"
                  >
                    <button
                      onClick={() => toggleStatus(t)}
                      className="flex items-center gap-2.5 text-left flex-1 min-w-0"
                    >
                      {t.status === "done" ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      ) : (
                        <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                      )}
                      <span
                        className={cn(
                          "truncate font-medium",
                          t.status === "done" && "line-through text-muted-foreground",
                        )}
                      >
                        {t.title}
                      </span>
                    </button>
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-muted text-muted-foreground ml-2">
                      {t.priority}
                    </span>
                  </motion.li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Quick Launch Cards */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-base font-semibold">Quick Actions</h3>
            <p className="mt-1 text-xs text-muted-foreground">Jump directly to key features</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Link
                to="/app/tasks"
                className="flex flex-col gap-2 rounded-lg border border-border bg-muted/30 p-3 hover:bg-accent transition-colors"
              >
                <ListTodo className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs font-semibold">Task Board</p>
                  <p className="text-[11px] text-muted-foreground">Kanban & Drag-and-drop</p>
                </div>
              </Link>

              <Link
                to="/app/focus"
                className="flex flex-col gap-2 rounded-lg border border-border bg-muted/30 p-3 hover:bg-accent transition-colors"
              >
                <Timer className="h-5 w-5 text-amber-500" />
                <div>
                  <p className="text-xs font-semibold">Pomodoro Timer</p>
                  <p className="text-[11px] text-muted-foreground">25 min focus sessions</p>
                </div>
              </Link>

              <Link
                to="/app/analytics"
                className="flex flex-col gap-2 rounded-lg border border-border bg-muted/30 p-3 hover:bg-accent transition-colors"
              >
                <TrendingUp className="h-5 w-5 text-emerald-500" />
                <div>
                  <p className="text-xs font-semibold">Analytics</p>
                  <p className="text-[11px] text-muted-foreground">Completion & Streaks</p>
                </div>
              </Link>

              <Link
                to="/app/settings"
                className="flex flex-col gap-2 rounded-lg border border-border bg-muted/30 p-3 hover:bg-accent transition-colors"
              >
                <Sparkles className="h-5 w-5 text-violet-500" />
                <div>
                  <p className="text-xs font-semibold">Account</p>
                  <p className="text-[11px] text-muted-foreground">User & preferences</p>
                </div>
              </Link>
            </div>
          </div>

          {/* API Health Monitor */}
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold">Backend Connection</h4>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium",
                  health?.database === "connected"
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                    : "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
                )}
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    health?.database === "connected" ? "bg-emerald-500" : "bg-amber-500",
                  )}
                />
                {healthLoading ? "Checking..." : health ? health.service : "Disconnected"}
              </span>
            </div>
            {healthError && <p className="mt-1 text-xs text-destructive">{healthError}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
