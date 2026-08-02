import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

export function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-svh overflow-hidden bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.18),transparent)]"
      />
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-4 py-5 md:px-6">
        <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground text-sm">
            M
          </span>
          Momentum
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild variant="ghost">
            <Link to="/app">Open app</Link>
          </Button>
          <Button asChild>
            <Link to="/app">Get started</Link>
          </Button>
        </div>
      </header>
      <main className="relative z-10">{children}</main>
    </div>
  );
}
