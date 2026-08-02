import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  loginUser,
  logoutUser,
  refreshSession,
  registerUser,
  type AuthSession,
  type PublicUser,
} from "@/lib/auth-api";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type AuthState =
  | { status: "loading" }
  | { status: "unauthenticated" }
  | { status: "authenticated"; user: PublicUser; accessToken: string };

type AuthContextValue = {
  state: AuthState;
  user: PublicUser | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------
const AuthContext = createContext<AuthContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: "loading" });
  // Keep a mutable ref so refresh timer callbacks can read the latest token
  const tokenRef = useRef<string | null>(null);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Schedule a silent token refresh ~14 min after issue (tokens expire in 15m)
  const scheduleRefresh = useCallback((delayMs = 14 * 60 * 1000) => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    refreshTimerRef.current = setTimeout(async () => {
      try {
        const session = await refreshSession();
        applySession(session);
      } catch {
        setState({ status: "unauthenticated" });
      }
    }, delayMs);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function applySession(session: AuthSession) {
    tokenRef.current = session.accessToken;
    setState({
      status: "authenticated",
      user: session.user,
      accessToken: session.accessToken,
    });
    scheduleRefresh();
  }

  // On mount — try to restore session from the refresh cookie
  useEffect(() => {
    let active = true;
    refreshSession()
      .then((session) => {
        if (active) applySession(session);
      })
      .catch(() => {
        if (active) setState({ status: "unauthenticated" });
      });

    return () => {
      active = false;
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = useCallback(async (email: string, password: string) => {
    const session = await loginUser({ email, password });
    applySession(session);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const register = useCallback(async (name: string, email: string, password: string) => {
    const session = await registerUser({ name, email, password });
    applySession(session);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const logout = useCallback(async () => {
    try {
      if (tokenRef.current) await logoutUser(tokenRef.current);
    } catch {
      // ignore — clear local state regardless
    }
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    tokenRef.current = null;
    setState({ status: "unauthenticated" });
  }, []);

  const value: AuthContextValue = {
    state,
    user: state.status === "authenticated" ? state.user : null,
    accessToken: state.status === "authenticated" ? state.accessToken : null,
    isLoading: state.status === "loading",
    isAuthenticated: state.status === "authenticated",
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}

// Convenience hook — only call inside authenticated routes
export function useRequiredAuth() {
  const { user, accessToken, isAuthenticated } = useAuth();
  if (!isAuthenticated || !user || !accessToken) {
    throw new Error("useRequiredAuth called outside authenticated route");
  }
  return { user, accessToken };
}
