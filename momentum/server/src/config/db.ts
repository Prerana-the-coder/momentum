import mongoose from "mongoose";
import type { Env } from "./env.js";

let inMemoryServer: any = null;

export async function connectDatabase(uri: string, env: Env["NODE_ENV"]): Promise<void> {
  mongoose.set("strictQuery", true);

  try {
    await mongoose.connect(uri);
    if (env === "development") console.info("[db] Connected to MongoDB @", uri);
    return;
  } catch (error) {
    console.error("[db] Connection failed", error);
    // Attempt to fall back to an in-memory MongoDB for development
    if (env === "development") {
      try {
        // Dynamically import to avoid adding runtime dependency in production
        const { MongoMemoryServer } = await import("mongodb-memory-server");
        inMemoryServer = await MongoMemoryServer.create();
        const memUri = inMemoryServer.getUri();
        console.info("[db] Started in-memory MongoDB for development at", memUri);
        await mongoose.connect(memUri);
        console.info("[db] Connected to in-memory MongoDB");
        return;
      } catch (memErr) {
        console.error("[db] In-memory MongoDB start failed", memErr);
        throw error;
      }
    }
    throw error;
  }
}

export async function disconnectDatabase(): Promise<void> {
  try {
    await mongoose.disconnect();
  } finally {
    if (inMemoryServer) {
      try {
        await inMemoryServer.stop();
        inMemoryServer = null;
      } catch {
        // ignore
      }
    }
  }
}
