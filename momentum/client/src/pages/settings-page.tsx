import {
  Check,
  LogOut,
  Moon,
  ShieldCheck,
  Sun,
  Laptop,
  Volume2,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SettingsPage() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem("momentum_sound") !== "false";
  });

  const [focusDuration, setFocusDuration] = useState(() => {
    return localStorage.getItem("momentum_focus_min") || "25";
  });

  const [saved, setSaved] = useState(false);

  function handleSavePreferences(e: React.FormEvent) {
    e.preventDefault();
    localStorage.setItem("momentum_sound", String(soundEnabled));
    localStorage.setItem("momentum_focus_min", focusDuration);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const userCreatedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Recently";

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Settings</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Manage your account, workspace preferences, and application theme
        </p>
      </div>

      {/* Profile Section */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-lg font-bold text-primary">
            {user?.name ? user.name[0].toUpperCase() : "M"}
          </div>
          <div>
            <h3 className="text-base font-semibold">{user?.name || "User Profile"}</h3>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 text-xs">
          <div>
            <span className="text-muted-foreground block mb-1">Account Role</span>
            <span className="font-semibold px-2 py-1 rounded bg-muted">Member</span>
          </div>
          <div>
            <span className="text-muted-foreground block mb-1">Member Since</span>
            <span className="font-semibold">{userCreatedDate}</span>
          </div>
        </div>
      </div>

      {/* Appearance Section */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <Sun className="h-4 w-4 text-primary" />
          <h3 className="text-base font-semibold">Appearance & Theme</h3>
        </div>

        <p className="text-xs text-muted-foreground">
          Select how Momentum looks on your device
        </p>

        <div className="grid grid-cols-3 gap-3">
          {[
            { id: "light", label: "Light", icon: Sun },
            { id: "dark", label: "Dark", icon: Moon },
            { id: "system", label: "System", icon: Laptop },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTheme(id)}
              className={cn(
                "flex flex-col items-center justify-center gap-2 rounded-xl border p-4 transition-all",
                theme === id
                  ? "border-primary bg-primary/10 text-primary font-semibold ring-2 ring-primary/30"
                  : "border-border bg-muted/20 text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Focus & Productivity Preferences */}
      <form onSubmit={handleSavePreferences} className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <Volume2 className="h-4 w-4 text-amber-500" />
          <h3 className="text-base font-semibold">Focus & Sounds</h3>
        </div>

        <div className="space-y-4 text-sm">
          {/* Focus Duration */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Default Pomodoro Interval</p>
              <p className="text-xs text-muted-foreground">Standard duration for focus sessions</p>
            </div>
            <select
              value={focusDuration}
              onChange={(e) => setFocusDuration(e.target.value)}
              className="rounded-lg border border-input bg-background px-3 py-1.5 text-xs font-medium outline-none"
            >
              <option value="15">15 minutes</option>
              <option value="25">25 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">60 minutes</option>
            </select>
          </div>

          {/* Sound Toggle */}
          <div className="flex items-center justify-between border-t border-border pt-3">
            <div>
              <p className="font-medium">Timer Beep & Audio Effects</p>
              <p className="text-xs text-muted-foreground">Play chime when focus interval ends</p>
            </div>
            <button
              type="button"
              onClick={() => setSoundEnabled((v) => !v)}
              className={cn(
                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                soundEnabled ? "bg-primary" : "bg-muted",
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
                  soundEnabled ? "translate-x-5" : "translate-x-0",
                )}
              />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border pt-4">
          <Button type="submit" size="sm">
            {saved ? <Check className="h-4 w-4 text-emerald-400" /> : null}
            {saved ? "Preferences saved" : "Save Preferences"}
          </Button>
        </div>
      </form>

      {/* Account & Security */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <h3 className="text-base font-semibold">Account & Security</h3>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div>
            <p className="font-medium">Sign Out of Workspace</p>
            <p className="text-xs text-muted-foreground">Clears session authentication from this device</p>
          </div>
          <Button variant="destructive" size="sm" onClick={() => logout()}>
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
}
