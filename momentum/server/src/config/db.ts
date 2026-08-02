import mongoose from "mongoose";
import type { Env } from "./env.js";

export async function connectDatabase(uri: string, env: Env["NODE_ENV"]): Promise<void> {
  mongoose.set("strictQuery", true);

  try {
    await mongoose.connect(uri);
    if (env === "development") {
      console.info("[db] Connected to MongoDB");
    }
  } catch (error) {
    console.error("[db] Connection failed", error);
    throw error;
  }
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}
