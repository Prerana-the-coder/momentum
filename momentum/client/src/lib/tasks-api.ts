import { apiRequest } from "@/lib/api";

export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type TaskStatus = "todo" | "in-progress" | "done";

export type Task = {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string | null;
  order: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
};

type AuthHeaders = { Authorization: string };

function authHeaders(token: string): AuthHeaders {
  return { Authorization: `Bearer ${token}` };
}

export type ListTasksParams = {
  status?: TaskStatus;
  priority?: TaskPriority;
  search?: string;
};

export function fetchTasks(token: string, params: ListTasksParams = {}) {
  const qs = new URLSearchParams();
  if (params.status) qs.set("status", params.status);
  if (params.priority) qs.set("priority", params.priority);
  if (params.search) qs.set("search", params.search);
  const query = qs.toString() ? `?${qs}` : "";
  return apiRequest<{ tasks: Task[] }>(`/api/tasks${query}`, {
    headers: authHeaders(token),
  });
}

export type CreateTaskInput = {
  title: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  dueDate?: string | null;
  order?: number;
};

export function createTask(token: string, input: CreateTaskInput) {
  return apiRequest<{ task: Task }>("/api/tasks", {
    method: "POST",
    headers: authHeaders(token),
    body: input,
  });
}

export type UpdateTaskInput = Partial<{
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string | null;
  order: number;
}>;

export function updateTask(token: string, id: string, input: UpdateTaskInput) {
  return apiRequest<{ task: Task }>(`/api/tasks/${id}`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: input,
  });
}

export function deleteTask(token: string, id: string) {
  return apiRequest<{ message: string }>(`/api/tasks/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
}
