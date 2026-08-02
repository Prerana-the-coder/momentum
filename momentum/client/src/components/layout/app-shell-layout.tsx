import { Outlet } from "react-router-dom";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";

export function AppShellLayout() {
  return (
    <div className="flex min-h-svh bg-background">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-border px-4 md:px-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Workspace
            </p>
            <h1 className="text-lg font-semibold tracking-tight">Momentum</h1>
          </div>
          <ThemeToggle />
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
