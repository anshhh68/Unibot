import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const queries = await prisma.query.findMany({
    where: { userId: user.id },
    include: {
      response: {
        select: { id: true, responseText: true, timestamp: true },
      },
    },
    orderBy: { timestamp: "asc" },
  });

  const result = queries.map((q) => ({
    id: q.id,
    content: q.content,
    response: q.response
      ? {
          id: q.response.id,
          response_text: q.response.responseText,
          timestamp: q.response.timestamp,
        }
      : null,
    timestamp: q.timestamp,
  }));

  return NextResponse.json(result);
}
