import { motion } from "framer-motion";
import { AlertCircle, Eye, EyeOff, Loader2, Zap } from "lucide-react";
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { ApiClientError } from "@/lib/api";

export function RegisterPage() {
  const { register, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!authLoading && isAuthenticated) return <Navigate to="/app" replace />;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register(name, email, password);
      navigate("/app", { replace: true });
    } catch (err) {
      if (err instanceof ApiClientError) setError(err.message);
      else setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative flex min-h-svh items-center justify-center bg-background px-4">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,hsl(var(--primary)/0.15),transparent)]"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-sm"
      >
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Zap className="h-4 w-4" />
          </span>
          <span className="text-lg font-semibold tracking-tight">Momentum</span>
        </Link>

        <div className="rounded-2xl border border-border bg-card p-8 shadow-xl shadow-black/5">
          <div className="mb-6 text-center">
            <h1 className="text-xl font-semibold tracking-tight">Create your account</h1>
            <p className="mt-1 text-sm text-muted-foreground">Start building momentum today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <label htmlFor="register-name" className="text-sm font-medium">
                Name
              </label>
              <input
                id="register-name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Johnson"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none ring-ring transition-shadow placeholder:text-muted-foreground/60 focus:ring-2"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="register-email" className="text-sm font-medium">
                Email
              </label>
              <input
                id="register-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none ring-ring transition-shadow placeholder:text-muted-foreground/60 focus:ring-2"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="register-password" className="text-sm font-medium">
                Password
              </label>
              <div className="relative">
                <input
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 pr-10 text-sm outline-none ring-ring transition-shadow placeholder:text-muted-foreground/60 focus:ring-2"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {password.length > 0 && password.length < 8 && (
                <p className="text-xs text-muted-foreground">
                  {8 - password.length} more character{8 - password.length !== 1 ? "s" : ""} needed
                </p>
              )}
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                role="alert"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </motion.div>
            )}

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitting ? "Creating account…" : "Create account"}
            </Button>
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
