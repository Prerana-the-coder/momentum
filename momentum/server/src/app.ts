import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import type { Env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFoundHandler } from "./middleware/notFoundHandler.js";
import { createAuthRouter } from "./routes/auth.routes.js";
import { healthRouter } from "./routes/health.routes.js";
import { createTaskRouter } from "./routes/task.routes.js";

export function createApp(env: Env) {
  const app = express();

  app.use(
    cors({
      origin: env.CLIENT_URL,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());

  app.get("/", (_req, res) => {
    res.json({
      success: true,
      data: { name: "Momentum API", tagline: "Build Momentum. Every Day." },
    });
  });

  app.use("/api/health", healthRouter);
  app.use("/api/auth", createAuthRouter(env));
  app.use("/api/tasks", createTaskRouter(env));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
