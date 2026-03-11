import { NextRequest, NextResponse } from "next/server";
import { getDemoUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const user = await getDemoUser(req);
  if (!user) {
    return NextResponse.json({ error: "Invalid role." }, { status: 400 });
  }

  const feedbacks = await prisma.feedback.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  const result = feedbacks.map((f: typeof feedbacks[number]) => ({
    id: f.id,
    user: f.userId,
    comment: f.comment,
    rating: f.rating,
    created_at: f.createdAt,
  }));

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const user = await getDemoUser(req);
  if (!user) {
    return NextResponse.json({ error: "Invalid role." }, { status: 400 });
  }

  const { comment, rating } = await req.json();

  if (!comment || !rating) {
    return NextResponse.json({ error: "comment and rating are required." }, { status: 400 });
  }

  if (rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be between 1 and 5." }, { status: 400 });
  }

  const feedback = await prisma.feedback.create({
    data: {
      userId: user.id,
      comment,
      rating,
    },
  });

  return NextResponse.json({
    id: feedback.id,
    user: feedback.userId,
    comment: feedback.comment,
    rating: feedback.rating,
    created_at: feedback.createdAt,
  }, { status: 201 });
}
