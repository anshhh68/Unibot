import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";
import { prisma } from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "dev-refresh-secret";
const ACCESS_TOKEN_EXPIRY = "6h";
const REFRESH_TOKEN_EXPIRY = "7d";

export interface JwtPayload {
  userId: number;
  role: string;
}

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
}

export function signRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_REFRESH_SECRET) as JwtPayload;
}

/**
 * Extract and verify the authenticated user from a request.
 * Returns the user record or null if not authenticated.
 */
export async function getAuthUser(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  try {
    const token = authHeader.slice(7);
    const payload = verifyAccessToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    return user;
  } catch {
    return null;
  }
}

/** Helper to serialize a user object for API responses (strip password). */
export function serializeUser(user: {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phone: string | null;
  department: string | null;
  avatarUrl: string | null;
}) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    first_name: user.firstName,
    last_name: user.lastName,
    role: user.role,
    phone: user.phone,
    department: user.department,
    avatar_url: user.avatarUrl,
  };
}
