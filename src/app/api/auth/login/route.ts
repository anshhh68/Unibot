import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signAccessToken, signRefreshToken, serializeUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    const payload = { userId: user.id, role: user.role };
    const access = signAccessToken(payload);
    const refresh = signRefreshToken(payload);

    return NextResponse.json({
      access,
      refresh,
      user: serializeUser(user),
    });
  } catch (e) {
    console.error("Login error:", e);
    return NextResponse.json({ error: "Login failed." }, { status: 500 });
  }
}
