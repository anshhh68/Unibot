import { NextRequest, NextResponse } from "next/server";
import { verifyRefreshToken, signAccessToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { refresh } = await req.json();
    if (!refresh) {
      return NextResponse.json({ error: "Refresh token required." }, { status: 400 });
    }

    const payload = verifyRefreshToken(refresh);
    const access = signAccessToken({ userId: payload.userId, role: payload.role });

    return NextResponse.json({ access });
  } catch {
    return NextResponse.json({ error: "Invalid or expired refresh token." }, { status: 401 });
  }
}
