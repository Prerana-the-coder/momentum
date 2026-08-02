import { config } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config({ path: path.resolve(__dirname, "../../.env") });

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  CLIENT_URL: z
    .string()
    .min(1)
    .default("http://localhost:5173,http://localhost:5174")
    .refine((value) => value.split(",").every((entry) => entry.trim().length > 0), {
      message: "CLIENT_URL must contain at least one valid URL",
    })
    .transform((value) => value.trim()),
  MONGODB_URI: z.string().min(1).default("mongodb://127.0.0.1:27017/momentum"),
  JWT_ACCESS_SECRET: z.string().min(32).default("dev-access-secret-momentum-min-32-chars!!"),
  JWT_REFRESH_SECRET: z.string().min(32).default("dev-refresh-secret-momentum-min-32-chars!!"),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
});

export type Env = z.infer<typeof envSchema>;

export function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const formatted = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Invalid environment configuration:\n${formatted}`);
  }
  return parsed.data;
}
