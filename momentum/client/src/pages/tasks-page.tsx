import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Circle,
  Clock,
  Flag,
  Loader2,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  createTask,
  deleteTask,
  fetchTasks,
  updateTask,
  type Task,
  type TaskPriority,
  type TaskStatus,
} from "@/lib/tasks-api";
import { ApiClientError } from "@/lib/api";

// ---------------------------------------------------------------------------
// Priority config
// ---------------------------------------------------------------------------
const PRIORITY_CONFIG: Record<
  TaskPriority,
  { label: string; color: string; bg: string; dot: string }
> = {
  low: {
    label: "Low",
    color: "text-sky-600 dark:text-sky-400",
    bg: "bg-sky-50 dark:bg-sky-950/50 border-sky-200 dark:border-sky-800",
    dot: "bg-sky-500",
  },
  medium: {
    label: "Medium",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800",
    dot: "bg-amber-500",
  },
  high: {
    label: "High",
    color: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-50 dark:bg-orange-950/50 border-orange-200 dark:border-orange-800",
    dot: "bg-orange-500",
  },
  urgent: {
    label: "Urgent",
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800",
    dot: "bg-red-500",
  },
};

// ---------------------------------------------------------------------------
// Column config
// ---------------------------------------------------------------------------
type Column = { id: TaskStatus; label: string; icon: React.ReactNode };

const COLUMNS: Column[] = [
  { id: "todo", label: "To Do", icon: <Circle className="h-4 w-4" /> },
  { id: "in-progress", label: "In Progress", icon: <Clock className="h-4 w-4" /> },
  { id: "done", label: "Done", icon: <CheckCircle2 className="h-4 w-4" /> },
];

// ---------------------------------------------------------------------------
// Small components
// ---------------------------------------------------------------------------
function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const cfg = PRIORITY_CONFIG[priority];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium",
        cfg.bg,
        cfg.color,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} />
      {cfg.label}
    </span>
  );
}

function TaskCard({
  task,
  onStatusChange,
  onDelete,
  dragging,
  onDragStart,
  onDragEnd,
}: {
  task: Task;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onDelete: (id: string) => void;
  dragging: boolean;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ duration: 0.18 }}
      draggable
      onDragStart={() => onDragStart(task.id)}
      onDragEnd={onDragEnd}
      className={cn(
        "group relative rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md",
        dragging && "opacity-40",
        "cursor-grab active:cursor-grabbing",
      )}
    >
      {/* Status cycle button */}
      <button
        aria-label="Cycle status"
        onClick={() => {
          const next: TaskStatus =
            task.status === "todo" ? "in-progress" : task.status === "in-progress" ? "done" : "todo";
          onStatusChange(task.id, next);
        }}
        className="absolute left-4 top-4 text-muted-foreground hover:text-primary transition-colors"
      >
        {task.status === "done" ? (
          <CheckCircle2 className="h-4 w-4 text-primary" />
        ) : task.status === "in-progress" ? (
          <Clock className="h-4 w-4" />
        ) : (
          <Circle className="h-4 w-4" />
        )}
      </button>

      <div className="pl-7 pr-7">
        <p className={cn("text-sm font-medium", task.status === "done" && "line-through text-muted-foreground")}>
          {task.title}
        </p>
        {task.description && (
          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{task.description}</p>
        )}
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <PriorityBadge priority={task.priority} />
          {task.dueDate && (
            <span className="text-[11px] text-muted-foreground">
              Due {new Date(task.dueDate).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      {/* Context menu */}
      <div ref={menuRef} className="absolute right-3 top-3">
        <button
          aria-label="Task options"
          onClick={() => setMenuOpen((v) => !v)}
          className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-accent hover:text-foreground transition-all"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-7 z-20 min-w-[140px] rounded-lg border border-border bg-popover p-1 shadow-lg">
            <button
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
              onClick={() => {
                onDelete(task.id);
                setMenuOpen(false);
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Inline add-task form
// ---------------------------------------------------------------------------
function AddTaskForm({
  status,
  onAdd,
  onCancel,
}: {
  status: TaskStatus;
  onAdd: (title: string, priority: TaskPriority) => Promise<void>;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    await onAdd(title.trim(), priority);
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-primary/30 bg-card p-3 shadow-sm space-y-2">
      <input
        ref={inputRef}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={`New task in ${status === "todo" ? "To Do" : status === "in-progress" ? "In Progress" : "Done"}…`}
        className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
      />
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-1">
          {(["low", "medium", "high", "urgent"] as TaskPriority[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPriority(p)}
              className={cn(
                "flex h-5 w-5 items-center justify-center rounded-full border transition-all",
                PRIORITY_CONFIG[p].dot,
                priority === p ? "ring-2 ring-ring ring-offset-1" : "opacity-50 hover:opacity-80",
              )}
              aria-label={`Set priority ${p}`}
              title={PRIORITY_CONFIG[p].label}
            />
          ))}
        </div>
        <div className="flex gap-1.5">
          <Button type="button" size="sm" variant="ghost" onClick={onCancel}>
            <X className="h-3.5 w-3.5" />
          </Button>
          <Button type="submit" size="sm" disabled={!title.trim() || loading}>
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Add
          </Button>
        </div>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export function TasksPage() {
  const { accessToken } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState<TaskPriority | "all">("all");
  const [addingIn, setAddingIn] = useState<TaskStatus | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<TaskStatus | null>(null);

  const load = useCallback(async () => {
    if (!accessToken) return;
    try {
      const data = await fetchTasks(accessToken);
      setTasks(data.tasks);
    } catch (err) {
      if (err instanceof ApiClientError) setError(err.message);
      else setError("Failed to load tasks.");
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAdd(title: string, priority: TaskPriority, status: TaskStatus) {
    if (!accessToken) return;
    try {
      const data = await createTask(accessToken, { title, priority, status });
      setTasks((prev) => [...prev, data.task]);
    } catch {
      /* ignore for now */
    }
    setAddingIn(null);
  }

  async function handleStatusChange(id: string, status: TaskStatus) {
    if (!accessToken) return;
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
    try {
      await updateTask(accessToken, id, { status });
    } catch {
      // rollback
      load();
    }
  }

  async function handleDelete(id: string) {
    if (!accessToken) return;
    setTasks((prev) => prev.filter((t) => t.id !== id));
    try {
      await deleteTask(accessToken, id);
    } catch {
      load();
    }
  }

  // Drag-and-drop handlers
  function handleDrop(targetStatus: TaskStatus) {
    if (!draggingId || !accessToken) return;
    const task = tasks.find((t) => t.id === draggingId);
    if (!task || task.status === targetStatus) return;
    handleStatusChange(draggingId, targetStatus);
    setDraggingId(null);
    setDragOverCol(null);
  }

  // Filter tasks
  const filtered = tasks.filter((t) => {
    const matchSearch = search
      ? t.title.toLowerCase().includes(search.toLowerCase())
      : true;
    const matchPriority = filterPriority !== "all" ? t.priority === filterPriority : true;
    return matchSearch && matchPriority;
  });

  const tasksByStatus = (status: TaskStatus) =>
    filtered.filter((t) => t.status === status).sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Tasks</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {tasks.length} task{tasks.length !== 1 ? "s" : ""} · {tasks.filter((t) => t.status === "done").length} done
          </p>
        </div>
        <Button onClick={() => setAddingIn("todo")} size="sm">
          <Plus className="h-4 w-4" />
          New task
        </Button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks…"
            className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none ring-ring focus:ring-2"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {/* Priority filter */}
        <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
          <Flag className="ml-1 h-3.5 w-3.5 text-muted-foreground" />
          {(["all", "urgent", "high", "medium", "low"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setFilterPriority(p)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition-colors capitalize",
                filterPriority === p
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent",
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Loading / Error */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}
      {error && !loading && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Kanban columns */}
      {!loading && !error && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {COLUMNS.map((col) => {
            const colTasks = tasksByStatus(col.id);
            const isDragOver = dragOverCol === col.id;

            return (
              <div
                key={col.id}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverCol(col.id);
                }}
                onDragLeave={() => setDragOverCol(null)}
                onDrop={() => handleDrop(col.id)}
                className={cn(
                  "flex flex-col gap-3 rounded-2xl border-2 bg-muted/30 p-3 transition-colors",
                  isDragOver
                    ? "border-primary/40 bg-primary/5"
                    : "border-transparent",
                )}
              >
                {/* Column header */}
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    {col.icon}
                    {col.label}
                    <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                      {colTasks.length}
                    </span>
                  </div>
                  <button
                    onClick={() => setAddingIn(col.id)}
                    aria-label={`Add task to ${col.label}`}
                    className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                {/* Tasks */}
                <AnimatePresence initial={false}>
                  {colTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onStatusChange={handleStatusChange}
                      onDelete={handleDelete}
                      dragging={draggingId === task.id}
                      onDragStart={setDraggingId}
                      onDragEnd={() => setDraggingId(null)}
                    />
                  ))}
                </AnimatePresence>

                {/* Inline add form */}
                <AnimatePresence>
                  {addingIn === col.id && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.18 }}
                    >
                      <AddTaskForm
                        status={col.id}
                        onAdd={(title, priority) => handleAdd(title, priority, col.id)}
                        onCancel={() => setAddingIn(null)}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Empty state */}
                {colTasks.length === 0 && addingIn !== col.id && (
                  <button
                    onClick={() => setAddingIn(col.id)}
                    className="flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border py-8 text-xs text-muted-foreground hover:border-primary/40 hover:text-primary/70 transition-colors"
                  >
                    <Plus className="h-5 w-5" />
                    Add a task
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
