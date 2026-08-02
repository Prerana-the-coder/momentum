import type { NextFunction, Request, Response } from "express";
import { AppError } from "./errorHandler.js";
import type { Env } from "../config/env.js";
import { verifyAccessToken } from "../utils/jwt.js";

export function createAuthenticate(env: Env) {
  return function authenticate(req: Request, _res: Response, next: NextFunction): void {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      next(new AppError(401, "Authentication required", "UNAUTHORIZED"));
      return;
    }

    const token = header.slice("Bearer ".length).trim();
    if (!token) {
      next(new AppError(401, "Authentication required", "UNAUTHORIZED"));
      return;
    }

    try {
      const payload = verifyAccessToken(env, token);
      req.auth = {
        userId: payload.sub,
        email: payload.email,
      };
      next();
    } catch (error) {
      next(error);
    }
  };
}
