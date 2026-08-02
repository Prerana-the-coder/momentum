import {
  BarChart3,
  CalendarDays,
  CheckSquare,
  Flame,
  LayoutDashboard,
  LogOut,
  Search,
  Settings,
  Timer,
  Zap,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";

export const appNavItems = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/app/tasks", label: "Tasks", icon: CheckSquare },
  { to: "/app/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/app/focus", label: "Focus", icon: Timer },
  { to: "/app/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/app/search", label: "Search", icon: Search },
  { to: "/app/settings", label: "Settings", icon: Settings },
] as const;

export function AppSidebar() {
  const { user, logout } = useAuth();

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "M";

  return (
    <aside className="hidden w-64 shrink-0 border-r border-sidebar-border bg-sidebar md:flex md:flex-col justify-between">
      <div>
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Zap className="h-4 w-4" aria-hidden />
          </div>
          <div>
            <p className="text-sm font-semibold text-sidebar-foreground">Momentum</p>
            <p className="text-xs text-muted-foreground">Build momentum daily</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1 p-3" aria-label="Main">
          {appNavItems.map(({ to, label, icon: Icon, ...item }) => (
            <NavLink
              key={to}
              to={to}
              end={"end" in item ? item.end : false}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground",
                  isActive && "bg-sidebar-accent text-sidebar-foreground",
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="border-t border-sidebar-border p-3 space-y-3">
        <div className="flex items-center gap-2 rounded-lg bg-accent/60 px-3 py-2 text-xs text-accent-foreground">
          <Flame className="h-4 w-4 shrink-0 text-orange-500" aria-hidden />
          <span>Keep your daily streak alive!</span>
        </div>

        {/* User Card */}
        {user && (
          <div className="flex items-center justify-between rounded-lg border border-sidebar-border bg-sidebar-accent/50 p-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
                {initials}
              </div>
              <div className="truncate">
                <p className="text-xs font-medium text-sidebar-foreground truncate">{user.name}</p>
                <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
            <button
              onClick={() => logout()}
              title="Sign out"
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-sidebar-accent hover:text-destructive transition-colors shrink-0"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
