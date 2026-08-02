import jwt from "jsonwebtoken";
import type { Env } from "../config/env.js";
import { AppError } from "../middleware/errorHandler.js";

export const REFRESH_COOKIE_NAME = "momentum_refresh";

export type AccessTokenPayload = {
  sub: string;
  email: string;
  type: "access";
};

export type RefreshTokenPayload = {
  sub: string;
  type: "refresh";
  tokenVersion: number;
};

export function signAccessToken(
  env: Env,
  payload: Omit<AccessTokenPayload, "type">,
): string {
  return jwt.sign({ ...payload, type: "access" satisfies AccessTokenPayload["type"] }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  } as jwt.SignOptions);
}

export function signRefreshToken(
  env: Env,
  payload: Omit<RefreshTokenPayload, "type">,
): string {
  return jwt.sign(
    { ...payload, type: "refresh" satisfies RefreshTokenPayload["type"] },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRES_IN } as jwt.SignOptions,
  );
}

export function verifyAccessToken(env: Env, token: string): AccessTokenPayload {
  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
    if (decoded.type !== "access") {
      throw new AppError(401, "Invalid access token", "INVALID_TOKEN");
    }
    return decoded;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(401, "Invalid or expired access token", "INVALID_TOKEN");
  }
}

export function verifyRefreshToken(env: Env, token: string): RefreshTokenPayload {
  try {
    const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
    if (decoded.type !== "refresh") {
      throw new AppError(401, "Invalid refresh token", "INVALID_TOKEN");
    }
    return decoded;
  } catch {
    throw new AppError(401, "Invalid or expired refresh token", "INVALID_TOKEN");
  }
}
