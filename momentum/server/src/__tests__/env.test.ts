import assert from "node:assert/strict";
import test, { describe } from "node:test";
import { loadEnv } from "../config/env.js";

describe("Environment config", () => {
  test("accepts comma-separated client urls", () => {
    const originalEnv = process.env;
    process.env = { ...originalEnv };

    process.env.NODE_ENV = "development";
    process.env.PORT = "4000";
    process.env.CLIENT_URL = "http://localhost:5173,http://localhost:5174";
    process.env.MONGODB_URI = "mongodb://127.0.0.1:27017/momentum";
    process.env.JWT_ACCESS_SECRET = "12345678901234567890123456789012";
    process.env.JWT_REFRESH_SECRET = "12345678901234567890123456789012";

    try {
      const env = loadEnv();
      assert.equal(env.CLIENT_URL, "http://localhost:5173,http://localhost:5174");
    } finally {
      process.env = originalEnv;
    }
  });
});
