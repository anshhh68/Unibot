import { NextRequest } from "next/server";
import { prisma } from "./prisma";

const DEMO_USERNAMES: Record<string, string> = {
  student: "student1",
  faculty: "prof_sharma",
};

export async function getDemoUser(req: NextRequest) {
  const role = req.headers.get("x-demo-role");
  const username = role ? DEMO_USERNAMES[role] : undefined;
  if (!username) return null;
  return prisma.user.findUnique({ where: { username } });
}
