import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, serializeUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }
  return NextResponse.json(serializeUser(user));
}

export async function PATCH(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const body = await req.json();
  const allowedFields = ["firstName", "lastName", "phone", "department", "avatarUrl"] as const;
  const fieldMap: Record<string, string> = {
    first_name: "firstName",
    last_name: "lastName",
    phone: "phone",
    department: "department",
    avatar_url: "avatarUrl",
  };

  const data: Record<string, string> = {};
  for (const [apiKey, prismaKey] of Object.entries(fieldMap)) {
    if (body[apiKey] !== undefined) {
      data[prismaKey] = body[apiKey];
    }
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data,
  });

  return NextResponse.json(serializeUser(updated));
}
