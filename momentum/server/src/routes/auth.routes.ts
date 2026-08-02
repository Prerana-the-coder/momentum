import { Router } from "express";
import type { Env } from "../config/env.js";
import { createAuthenticate } from "../middleware/authenticate.js";
import { AppError } from "../middleware/errorHandler.js";
import {
  getUserById,
  loginUser,
  logoutUser,
  refreshSession,
  registerUser,
} from "../services/auth.service.js";
import { REFRESH_COOKIE_NAME } from "../utils/jwt.js";
import { loginSchema, registerSchema } from "../validators/auth.schema.js";

export function createAuthRouter(env: Env) {
  const authRouter = Router();
  const authenticate = createAuthenticate(env);

  authRouter.post("/register", async (req, res, next) => {
    try {
      const input = registerSchema.parse(req.body);
      const data = await registerUser(env, input, res);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  });

  authRouter.post("/login", async (req, res, next) => {
    try {
      const input = loginSchema.parse(req.body);
      const data = await loginUser(env, input, res);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  });

  authRouter.post("/refresh", async (req, res, next) => {
    try {
      const refreshToken = req.cookies[REFRESH_COOKIE_NAME] as string | undefined;
      const data = await refreshSession(env, refreshToken, res);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  });

  authRouter.post("/logout", authenticate, async (req, res, next) => {
    try {
      if (!req.auth) {
        throw new AppError(401, "Authentication required", "UNAUTHORIZED");
      }
      await logoutUser(env, req.auth.userId, res);
      res.json({ success: true, data: { message: "Logged out" } });
    } catch (error) {
      next(error);
    }
  });

  authRouter.get("/me", authenticate, async (req, res, next) => {
    try {
      if (!req.auth) {
        throw new AppError(401, "Authentication required", "UNAUTHORIZED");
      }
      const user = await getUserById(req.auth.userId);
      res.json({ success: true, data: { user } });
    } catch (error) {
      next(error);
    }
  });

  return authRouter;
}
