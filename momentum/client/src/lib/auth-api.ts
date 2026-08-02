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
  });
}

export function loginUser(body: { email: string; password: string }) {
  return apiRequest<AuthSession>("/api/auth/login", {
    method: "POST",
    body,
  });
}

export function logoutUser(accessToken: string) {
  return apiRequest<{ message: string }>("/api/auth/logout", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export function getMe(accessToken: string) {
  return apiRequest<{ user: PublicUser }>("/api/auth/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export function refreshSession() {
  return apiRequest<AuthSession>("/api/auth/refresh", { method: "POST" });
}
