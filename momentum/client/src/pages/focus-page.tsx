import { motion, AnimatePresence } from "framer-motion";
import { Pause, Play, RefreshCw, Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types & constants
// ---------------------------------------------------------------------------
type Mode = "focus" | "short-break" | "long-break";

const PRESETS: Record<Mode, { label: string; minutes: number; color: string }> = {
  focus: { label: "Focus", minutes: 25, color: "hsl(var(--primary))" },
  "short-break": { label: "Short Break", minutes: 5, color: "hsl(160 65% 45%)" },
  "long-break": { label: "Long Break", minutes: 15, color: "hsl(220 70% 55%)" },
};

const SVG_SIZE = 240;
const STROKE = 10;
const R = (SVG_SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * R;

// ---------------------------------------------------------------------------
// Web Audio beep
// ---------------------------------------------------------------------------
function playBeep() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
    osc.start();
    osc.stop(ctx.currentTime + 0.8);
  } catch {
    // AudioContext not available — silently ignore
  }
}

// ---------------------------------------------------------------------------
// Circular progress ring
// ---------------------------------------------------------------------------
function Ring({ progress, color }: { progress: number; color: string }) {
  const offset = CIRCUMFERENCE * (1 - progress);

  return (
    <svg
      width={SVG_SIZE}
      height={SVG_SIZE}
      viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
      className="-rotate-90"
      aria-hidden
    >
      {/* Track */}
      <circle
        cx={SVG_SIZE / 2}
        cy={SVG_SIZE / 2}
        r={R}
        fill="none"
        stroke="hsl(var(--border))"
        strokeWidth={STROKE}
      />
      {/* Progress */}
      <circle
        cx={SVG_SIZE / 2}
        cy={SVG_SIZE / 2}
        r={R}
        fill="none"
        stroke={color}
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 1s linear" }}
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Format seconds → MM:SS
// ---------------------------------------------------------------------------
function fmt(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export function FocusPage() {
  const [mode, setMode] = useState<Mode>("focus");
  const [secondsLeft, setSecondsLeft] = useState(PRESETS.focus.minutes * 60);
  const [running, setRunning] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [sessions, setSessions] = useState(0);
  const [completedSession, setCompletedSession] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const totalSeconds = PRESETS[mode].minutes * 60;
  const progress = secondsLeft / totalSeconds;
  const { color } = PRESETS[mode];

  const reset = useCallback(
    (newMode: Mode = mode) => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setRunning(false);
      setSecondsLeft(PRESETS[newMode].minutes * 60);
      setCompletedSession(false);
    },
    [mode],
  );

  function switchMode(newMode: Mode) {
    setMode(newMode);
    reset(newMode);
  }

  useEffect(() => {
    if (!running) return;

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          setRunning(false);
          setCompletedSession(true);
          if (soundOn) playBeep();
          if (mode === "focus") setSessions((s) => s + 1);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, soundOn, mode]);

  // Update document title while running
  useEffect(() => {
    if (running) {
      document.title = `${fmt(secondsLeft)} — ${PRESETS[mode].label} · Momentum`;
    } else {
      document.title = "Focus · Momentum";
    }
    return () => {
      document.title = "Momentum";
    };
  }, [running, secondsLeft, mode]);

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Focus</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Pomodoro timer · {sessions} session{sessions !== 1 ? "s" : ""} completed today
        </p>
      </div>

      {/* Mode tabs */}
      <div className="flex gap-1 rounded-xl border border-border bg-muted/40 p-1">
        {(Object.entries(PRESETS) as [Mode, (typeof PRESETS)[Mode]][]).map(([key, cfg]) => (
          <button
            key={key}
            onClick={() => switchMode(key)}
            className={cn(
              "flex-1 rounded-lg py-2 text-sm font-medium transition-all",
              mode === key
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {cfg.label}
            <span className="ml-1.5 text-xs opacity-60">{cfg.minutes}m</span>
          </button>
        ))}
      </div>

      {/* Timer ring */}
      <div className="flex flex-col items-center gap-6">
        <div className="relative flex items-center justify-center">
          <Ring progress={progress} color={color} />
          {/* Center content */}
          <div className="absolute flex flex-col items-center">
            <AnimatePresence mode="wait">
              {completedSession ? (
                <motion.p
                  key="done"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-2xl font-semibold text-primary"
                >
                  Done! 🎉
                </motion.p>
              ) : (
                <motion.p
                  key="time"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="font-mono text-5xl font-semibold tabular-nums tracking-tight"
                >
                  {fmt(secondsLeft)}
                </motion.p>
              )}
            </AnimatePresence>
            <p className="mt-1 text-xs text-muted-foreground">{PRESETS[mode].label}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSoundOn((v) => !v)}
            aria-label={soundOn ? "Mute sound" : "Enable sound"}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>

          <Button
            size="lg"
            onClick={() => {
              if (completedSession) {
                reset();
              } else {
                setRunning((v) => !v);
              }
            }}
            className="h-14 w-14 rounded-full p-0 text-lg shadow-lg"
            style={{ background: color }}
          >
            <AnimatePresence mode="wait">
              {completedSession ? (
                <motion.span key="reset" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <RefreshCw className="h-5 w-5" />
                </motion.span>
              ) : running ? (
                <motion.span key="pause" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Pause className="h-5 w-5" />
                </motion.span>
              ) : (
                <motion.span key="play" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Play className="h-5 w-5 translate-x-0.5" />
                </motion.span>
              )}
            </AnimatePresence>
          </Button>

          <button
            onClick={() => reset()}
            aria-label="Reset timer"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Session dots */}
      <div className="flex flex-col items-center gap-2">
        <p className="text-xs text-muted-foreground">Today&apos;s sessions</p>
        <div className="flex gap-2">
          {Array.from({ length: Math.max(sessions, 4) }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className={cn(
                "h-3 w-3 rounded-full border-2 transition-colors",
                i < sessions
                  ? "border-primary bg-primary"
                  : "border-border bg-transparent",
              )}
            />
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">Pomodoro technique</p>
        <ol className="mt-2 space-y-1 list-decimal list-inside">
          <li>Work for 25 minutes with full focus</li>
          <li>Take a 5-minute short break</li>
          <li>After 4 sessions, take a 15-minute long break</li>
        </ol>
      </div>
    </div>
  );
}
