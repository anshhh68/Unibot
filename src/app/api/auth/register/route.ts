import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { serializeUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, email, password, password_confirm, first_name, last_name, role, department } = body;

    if (!username || !email || !password || !password_confirm || !first_name || !last_name) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    if (password !== password_confirm) {
      return NextResponse.json({ password_confirm: "Passwords do not match." }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ password: "Password must be at least 8 characters." }, { status: 400 });
    }

    const existing = await prisma.user.findFirst({
      where: { OR: [{ username }, { email }] },
    });
    if (existing) {
      return NextResponse.json({ error: "Username or email already exists." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        firstName: first_name,
        lastName: last_name,
        role: role || "student",
        department: department || null,
      },
    });

    return NextResponse.json(serializeUser(user), { status: 201 });
  } catch (e) {
    console.error("Register error:", e);
    return NextResponse.json({ error: "Registration failed." }, { status: 500 });
  }
}
