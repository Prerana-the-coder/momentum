import { apiRequest } from "@/lib/api";

export type PublicUser = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
};

export type AuthSession = {
  user: PublicUser;
  accessToken: string;
};

export function registerUser(body: { name: string; email: string; password: string }) {
  return apiRequest<AuthSession>("/api/auth/register", {
    method: "POST",
    body,
  }).catch((err) => {
    // Development fallback when backend is unreachable
    if (import.meta.env.DEV) {
      const now = new Date().toISOString();
      return {
        user: { id: "local", name: body.name, email: body.email, createdAt: now, updatedAt: now },
        accessToken: "dev-access-token",
      } as AuthSession;
    }
    throw err;
  });
}

export function loginUser(body: { email: string; password: string }) {
  return apiRequest<AuthSession>("/api/auth/login", {
    method: "POST",
    body,
  }).catch((err) => {
    if (import.meta.env.DEV) {
      const now = new Date().toISOString();
      return {
        user: { id: "local", name: "Dev User", email: body.email, createdAt: now, updatedAt: now },
        accessToken: "dev-access-token",
      } as AuthSession;
    }
    throw err;
  });
}

export function logoutUser(accessToken: string) {
  return apiRequest<{ message: string }>("/api/auth/logout", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
  }).catch((err) => {
    if (import.meta.env.DEV) return { message: "Logged out (dev)" };
    throw err;
  });
}

export function getMe(accessToken: string) {
  return apiRequest<{ user: PublicUser }>("/api/auth/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  }).catch((err) => {
    if (import.meta.env.DEV) {
      const now = new Date().toISOString();
      return { user: { id: "local", name: "Dev User", email: "dev@local", createdAt: now, updatedAt: now } };
    }
    throw err;
  });
}

export function refreshSession() {
  return apiRequest<AuthSession>("/api/auth/refresh", { method: "POST" }).catch((err) => {
    if (import.meta.env.DEV) {
      const now = new Date().toISOString();
      return {
        user: { id: "local", name: "Dev User", email: "dev@local", createdAt: now, updatedAt: now },
        accessToken: "dev-access-token",
      } as AuthSession;
    }
    throw err;
  });
}
