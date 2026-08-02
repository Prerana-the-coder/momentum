import { motion } from "framer-motion";
import { ArrowRight, CalendarDays, CheckCircle2, LineChart, Timer } from "lucide-react";
import { Link } from "react-router-dom";
import { MarketingLayout } from "@/components/layout/marketing-layout";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: CheckCircle2,
    title: "Tasks that stay organized",
    description: "Priorities, categories, due dates, and drag-and-drop — built for deep work, not busywork.",
  },
  {
    icon: CalendarDays,
    title: "Plan across time",
    description: "Calendar views, recurring tasks, and smart reminders keep your week aligned.",
  },
  {
    icon: Timer,
    title: "Focus with intent",
    description: "Pomodoro sessions and streak tracking help you protect momentum every day.",
  },
  {
    icon: LineChart,
    title: "See your progress",
    description: "Analytics and charts surface what’s working so you can iterate on your habits.",
  },
];

export function LandingPage() {
  return (
    <MarketingLayout>
      <section className="mx-auto max-w-6xl px-4 pb-24 pt-8 md:px-6 md:pt-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-3xl text-center"
        >
          <p className="mb-4 inline-flex rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            Productivity for people who ship
          </p>
          <h1 className="text-balance text-4xl font-semibold tracking-tight md:text-6xl">
            Build <span className="text-primary">Momentum.</span>
            <br />
            Every Day.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-base text-muted-foreground md:text-lg">
            Momentum is a modern task workspace — calm, fast, and opinionated — so you can plan,
            focus, and finish what matters.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/app">
                Launch workspace
                <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="#features">Explore features</a>
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-16 max-w-5xl rounded-2xl border border-border bg-card/80 p-2 shadow-2xl shadow-primary/5 backdrop-blur-sm md:p-3"
        >
          <div className="rounded-xl border border-border/80 bg-background p-6 md:p-8">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium">Today</p>
                <p className="text-xs text-muted-foreground">Preview · dashboard ships next</p>
              </div>
              <span className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
                3 tasks in focus
              </span>
            </div>
            <ul className="space-y-3">
              {["Ship auth & secure sessions", "Design task board interactions", "Wire analytics charts"].map(
                (task, index) => (
                  <li
                    key={task}
                    className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm"
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-full border border-primary/40 text-[10px] font-semibold text-primary">
                      {index + 1}
                    </span>
                    {task}
                  </li>
                ),
              )}
            </ul>
          </div>
        </motion.div>
      </section>

      <section id="features" className="border-t border-border bg-muted/30 py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight">Everything in one calm workspace</h2>
            <p className="mt-3 text-muted-foreground">
              We&apos;re building Momentum feature-by-feature with production-grade architecture —
              starting with foundation, then auth, tasks, and beyond.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {features.map(({ icon: Icon, title, description }, index) => (
              <motion.article
                key={title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: index * 0.05, duration: 0.4 }}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
