import { Loader2 } from "lucide-react";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import { AppShellLayout } from "@/components/layout/app-shell-layout";
import { AuthProvider, useAuth } from "@/context/auth-context";
import { AnalyticsPage } from "@/pages/analytics-page";
import { CalendarPage } from "@/pages/calendar-page";
import { DashboardPage } from "@/pages/dashboard-page";
import { FocusPage } from "@/pages/focus-page";
import { LandingPage } from "@/pages/landing-page";
import { LoginPage } from "@/pages/login-page";
import { RegisterPage } from "@/pages/register-page";
import { SearchPage } from "@/pages/search-page";
import { SettingsPage } from "@/pages/settings-page";
import { TasksPage } from "@/pages/tasks-page";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export const router = createBrowserRouter([
  { path: "/", element: <LandingPage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  {
    path: "/app",
    element: (
      <PrivateRoute>
        <AppShellLayout />
      </PrivateRoute>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "tasks", element: <TasksPage /> },
      { path: "calendar", element: <CalendarPage /> },
      { path: "focus", element: <FocusPage /> },
      { path: "analytics", element: <AnalyticsPage /> },
      { path: "search", element: <SearchPage /> },
      { path: "settings", element: <SettingsPage /> },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);

export function AppRouter() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
