import type { Response } from "express";
import type { Env } from "../config/env.js";
import { AppError } from "../middleware/errorHandler.js";
import { hashPassword, toPublicUser, User, type UserDocument } from "../models/User.js";
import {
  REFRESH_COOKIE_NAME,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";
import type { LoginInput, RegisterInput } from "../validators/auth.schema.js";

const REFRESH_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function setRefreshCookie(res: Response, env: Env, token: string) {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth",
    maxAge: REFRESH_MAX_AGE_MS,
  });
}

function clearRefreshCookie(res: Response, env: Env) {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth",
  });
}

function issueSession(env: Env, user: UserDocument, res: Response) {
  const accessToken = signAccessToken(env, {
    sub: user._id.toString(),
    email: user.email,
  });

  const refreshToken = signRefreshToken(env, {
    sub: user._id.toString(),
    tokenVersion: user.tokenVersion,
  });

  setRefreshCookie(res, env, refreshToken);

  return {
    user: toPublicUser(user),
    accessToken,
  };
}

export async function registerUser(env: Env, input: RegisterInput, res: Response) {
  const email = input.email.toLowerCase();
  const existing = await User.findOne({ email }).lean();
  if (existing) {
    throw new AppError(409, "An account with this email already exists", "EMAIL_IN_USE");
  }

  const passwordHash = await hashPassword(input.password);
  const user = await User.create({
    name: input.name,
    email,
    passwordHash,
  });

  return issueSession(env, user, res);
}

export async function loginUser(env: Env, input: LoginInput, res: Response) {
  const email = input.email.toLowerCase();
  const user = await User.findOne({ email }).select("+passwordHash");
  if (!user) {
    throw new AppError(401, "Invalid email or password", "INVALID_CREDENTIALS");
  }

  const valid = await user.comparePassword(input.password);
  if (!valid) {
    throw new AppError(401, "Invalid email or password", "INVALID_CREDENTIALS");
  }

  return issueSession(env, user, res);
}

export async function refreshSession(env: Env, refreshToken: string | undefined, res: Response) {
  if (!refreshToken) {
    throw new AppError(401, "Refresh token missing", "NO_REFRESH_TOKEN");
  }

  const payload = verifyRefreshToken(env, refreshToken);
  const user = await User.findById(payload.sub);
  if (!user) {
    throw new AppError(401, "User not found", "INVALID_TOKEN");
  }

  if (user.tokenVersion !== payload.tokenVersion) {
    clearRefreshCookie(res, env);
    throw new AppError(401, "Session expired", "SESSION_REVOKED");
  }

  return issueSession(env, user, res);
}

export async function logoutUser(env: Env, userId: string, res: Response) {
  await User.findByIdAndUpdate(userId, { $inc: { tokenVersion: 1 } });
  clearRefreshCookie(res, env);
}

export async function getUserById(userId: string) {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(404, "User not found", "USER_NOT_FOUND");
  }
  return toPublicUser(user);
}
