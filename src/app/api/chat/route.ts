import { NextRequest, NextResponse } from "next/server";
import { getDemoUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAiResponse } from "@/lib/chat-service";

export async function POST(req: NextRequest) {
  const user = await getDemoUser(req);
  if (!user) {
    return NextResponse.json({ error: "Invalid role." }, { status: 400 });
  }

  const { message } = await req.json();
  if (!message || typeof message !== "string" || message.length > 2000) {
    return NextResponse.json({ error: "Invalid message." }, { status: 400 });
  }

  // Save query
  const query = await prisma.query.create({
    data: { userId: user.id, content: message },
  });

  // Get AI response
  const userName = user.firstName || user.username;
  const aiText = await getAiResponse(message, user.id, userName);

  // Save response
  await prisma.response.create({
    data: { queryId: query.id, responseText: aiText },
  });

  return NextResponse.json({
    query_id: query.id,
    message,
    response: aiText,
    timestamp: query.timestamp,
  });
}
