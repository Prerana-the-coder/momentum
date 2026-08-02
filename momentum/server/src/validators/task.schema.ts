import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  description: z.string().trim().max(2000).optional().default(""),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional().default("medium"),
  status: z.enum(["todo", "in-progress", "done"]).optional().default("todo"),
  dueDate: z.string().datetime({ offset: true }).nullable().optional(),
  order: z.number().int().optional().default(0),
});

export const updateTaskSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(2000).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  status: z.enum(["todo", "in-progress", "done"]).optional(),
  dueDate: z.string().datetime({ offset: true }).nullable().optional(),
  order: z.number().int().optional(),
});

export const listTasksQuerySchema = z.object({
  status: z.enum(["todo", "in-progress", "done"]).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  search: z.string().trim().max(100).optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type ListTasksQuery = z.infer<typeof listTasksQuerySchema>;
