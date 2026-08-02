import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Circle,
  Clock,
  Filter,
  Search as SearchIcon,
  SlidersHorizontal,
  Trash2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { deleteTask, fetchTasks, updateTask, type Task, type TaskPriority, type TaskStatus } from "@/lib/tasks-api";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SortOption = "newest" | "oldest" | "priority" | "title";

const PRIORITY_RANK: Record<TaskPriority, number> = {
  urgent: 4,
  high: 3,
  medium: 2,
  low: 1,
};

export function SearchPage() {
  const { accessToken } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "all">("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");

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

  async function handleDelete(id: string) {
    if (!accessToken) return;
    setTasks((prev) => prev.filter((t) => t.id !== id));
    try {
      await deleteTask(accessToken, id);
    } catch {
      loadTasks();
    }
  }

  // Filter & sort
  const filtered = tasks.filter((t) => {
    const q = query.toLowerCase().trim();
    const matchQuery =
      !q || t.title.toLowerCase().includes(q) || (t.description && t.description.toLowerCase().includes(q));
    const matchStatus = statusFilter === "all" || t.status === statusFilter;
    const matchPriority = priorityFilter === "all" || t.priority === priorityFilter;

    return matchQuery && matchStatus && matchPriority;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortBy === "oldest") {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    if (sortBy === "priority") {
      return PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority];
    }
    if (sortBy === "title") {
      return a.title.localeCompare(b.title);
    }
    return 0;
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Search & Discovery</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Find, filter, and organize tasks across your workspace
        </p>
      </div>

      {/* Search Input Box */}
      <div className="relative">
        <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title, keywords, or details..."
          className="w-full rounded-2xl border border-input bg-card py-3.5 pl-12 pr-10 text-base outline-none ring-ring shadow-sm focus:ring-2 placeholder:text-muted-foreground/60"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-xs">
        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-muted-foreground mr-1 flex items-center gap-1">
            <Filter className="h-3.5 w-3.5" /> Status:
          </span>
          {(["all", "todo", "in-progress", "done"] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={cn(
                "rounded-lg px-2.5 py-1 text-xs font-medium transition-colors capitalize",
                statusFilter === st
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "bg-muted/40 text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Priority Filters & Sorting */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-muted-foreground mr-1">Priority:</span>
            {(["all", "urgent", "high", "medium", "low"] as const).map((pr) => (
              <button
                key={pr}
                onClick={() => setPriorityFilter(pr)}
                className={cn(
                  "rounded-lg px-2.5 py-1 text-xs font-medium transition-colors capitalize",
                  priorityFilter === pr
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "bg-muted/40 text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                {pr}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 border-l border-border pl-3">
            <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="rounded-lg border border-input bg-background px-2.5 py-1 text-xs font-medium outline-none"
            >
              <option value="newest">Sort: Newest</option>
              <option value="oldest">Sort: Oldest</option>
              <option value="priority">Sort: Priority</option>
              <option value="title">Sort: Title</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <span>
          Found <strong>{sorted.length}</strong> matching task{sorted.length !== 1 ? "s" : ""}
        </span>
        {(query || statusFilter !== "all" || priorityFilter !== "all") && (
          <button
            onClick={() => {
              setQuery("");
              setStatusFilter("all");
              setPriorityFilter("all");
            }}
            className="text-primary hover:underline font-medium"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Search Results List */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-12 text-center text-sm text-muted-foreground">Searching workspace...</div>
        ) : sorted.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
            <SearchIcon className="mx-auto h-8 w-8 text-muted-foreground/50" />
            <p className="mt-3 text-sm font-semibold">No matching tasks found</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Try adjusting your query string or clearing status/priority filters.
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {sorted.map((task) => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group flex items-start justify-between rounded-2xl border border-border bg-card p-4 shadow-xs transition-shadow hover:shadow-md"
              >
                <div className="flex items-start gap-3 flex-1 min-w-0 pr-4">
                  <button
                    onClick={() => handleToggleStatus(task)}
                    className="mt-0.5 text-muted-foreground hover:text-primary transition-colors shrink-0"
                  >
                    {task.status === "done" ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    ) : task.status === "in-progress" ? (
                      <Clock className="h-5 w-5 text-amber-500" />
                    ) : (
                      <Circle className="h-5 w-5" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4
                        className={cn(
                          "text-base font-medium",
                          task.status === "done" && "line-through text-muted-foreground",
                        )}
                      >
                        {task.title}
                      </h4>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold capitalize text-muted-foreground">
                        {task.priority}
                      </span>
                      <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold capitalize text-accent-foreground">
                        {task.status}
                      </span>
                    </div>

                    {task.description && (
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                        {task.description}
                      </p>
                    )}

                    <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
                      <span>Created {new Date(task.createdAt).toLocaleDateString()}</span>
                      {task.dueDate && (
                        <span>Due {new Date(task.dueDate).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleDelete(task.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
