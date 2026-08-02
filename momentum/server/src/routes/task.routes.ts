import mongoose from "mongoose";
import { Router } from "express";
import type { Env } from "../config/env.js";
import { createAuthenticate } from "../middleware/authenticate.js";
import { AppError } from "../middleware/errorHandler.js";
import { Task, toPublicTask } from "../models/Task.js";
import {
  createTaskSchema,
  listTasksQuerySchema,
  updateTaskSchema,
} from "../validators/task.schema.js";

export function createTaskRouter(env: Env) {
  const router = Router();
  const authenticate = createAuthenticate(env);

  // All task routes require auth
  router.use(authenticate);

  // GET /api/tasks — list tasks for the current user
  router.get("/", async (req, res, next) => {
    try {
      const query = listTasksQuerySchema.parse(req.query);
      const filter: Record<string, unknown> = { userId: req.auth!.userId };

      if (query.status) filter.status = query.status;
      if (query.priority) filter.priority = query.priority;
      if (query.search) {
        filter.title = { $regex: query.search, $options: "i" };
      }

      const tasks = await Task.find(filter).sort({ order: 1, createdAt: -1 }).lean();
      res.json({ success: true, data: { tasks: tasks.map(toPublicTask) } });
    } catch (error) {
      next(error);
    }
  });

  // POST /api/tasks — create a task
  router.post("/", async (req, res, next) => {
    try {
      const input = createTaskSchema.parse(req.body);

      // Place at the end of the column by default
      const lastTask = await Task.findOne({ userId: req.auth!.userId, status: input.status })
        .sort({ order: -1 })
        .lean();
      const order = input.order ?? (lastTask ? lastTask.order + 1 : 0);

      const task = await Task.create({
        ...input,
        order,
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
        userId: req.auth!.userId,
      });

      res.status(201).json({ success: true, data: { task: toPublicTask(task) } });
    } catch (error) {
      next(error);
    }
  });

  // PATCH /api/tasks/:id — update a task
  router.patch("/:id", async (req, res, next) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        throw new AppError(400, "Invalid task ID", "INVALID_ID");
      }

      const input = updateTaskSchema.parse(req.body);
      const update: Record<string, unknown> = { ...input };
      if (input.dueDate !== undefined) {
        update.dueDate = input.dueDate ? new Date(input.dueDate) : null;
      }

      const task = await Task.findOneAndUpdate(
        { _id: req.params.id, userId: req.auth!.userId },
        { $set: update },
        { new: true },
      );

      if (!task) throw new AppError(404, "Task not found", "NOT_FOUND");

      res.json({ success: true, data: { task: toPublicTask(task) } });
    } catch (error) {
      next(error);
    }
  });

  // DELETE /api/tasks/:id
  router.delete("/:id", async (req, res, next) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        throw new AppError(400, "Invalid task ID", "INVALID_ID");
      }

      const task = await Task.findOneAndDelete({
        _id: req.params.id,
        userId: req.auth!.userId,
      });

      if (!task) throw new AppError(404, "Task not found", "NOT_FOUND");

      res.json({ success: true, data: { message: "Task deleted" } });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
