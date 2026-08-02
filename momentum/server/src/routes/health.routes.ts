import { Router } from "express";
import mongoose from "mongoose";

export const healthRouter = Router();

healthRouter.get("/", (_req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus =
    dbState === 1 ? "connected" : dbState === 2 ? "connecting" : "disconnected";

  res.json({
    success: true,
    data: {
      service: "momentum-api",
      status: "ok",
      timestamp: new Date().toISOString(),
      database: dbStatus,
    },
  });
});
