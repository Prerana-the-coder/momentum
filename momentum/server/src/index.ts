import { createApp } from "./app.js";
import { connectDatabase } from "./config/db.js";
import { loadEnv } from "./config/env.js";

async function bootstrap() {
  const env = loadEnv();
  await connectDatabase(env.MONGODB_URI, env.NODE_ENV);

  const app = createApp(env);
  const server = app.listen(env.PORT, () => {
    console.info(`[server] Momentum API listening on http://localhost:${env.PORT}`);
  });

  const shutdown = async (signal: string) => {
    console.info(`[server] ${signal} received, shutting down`);
    server.close(() => process.exit(0));
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
}

bootstrap().catch((error) => {
  console.error("[server] Failed to start", error);
  process.exit(1);
});
