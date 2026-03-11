import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user || user.role !== "faculty") {
    return NextResponse.json({ error: "Faculty access required." }, { status: 403 });
  }

  const assignments = await prisma.assignment.findMany({
    where: { facultyId: user.id },
    include: { course: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  const result = assignments.map((a: typeof assignments[number]) => ({
    id: a.id,
    course: a.courseId,
    course_name: a.course.name,
    faculty: a.facultyId,
    title: a.title,
    content: a.content,
    due_date: a.dueDate,
    created_at: a.createdAt,
    updated_at: a.updatedAt,
  }));

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user || user.role !== "faculty") {
    return NextResponse.json({ error: "Faculty access required." }, { status: 403 });
  }

  const { course, title, content, due_date } = await req.json();

  if (!course || !title || !content) {
    return NextResponse.json({ error: "course, title, and content are required." }, { status: 400 });
  }

  // Verify the faculty owns this course
  const courseRecord = await prisma.course.findFirst({
    where: { id: course, facultyId: user.id },
  });
  if (!courseRecord) {
    return NextResponse.json({ error: "Course not found or not assigned to you." }, { status: 404 });
  }

  const assignment = await prisma.assignment.create({
    data: {
      courseId: course,
      facultyId: user.id,
      title,
      content,
      dueDate: due_date ? new Date(due_date) : null,
    },
    include: { course: { select: { name: true } } },
  });

  return NextResponse.json({
    id: assignment.id,
    course: assignment.courseId,
    course_name: assignment.course.name,
    faculty: assignment.facultyId,
    title: assignment.title,
    content: assignment.content,
    due_date: assignment.dueDate,
    created_at: assignment.createdAt,
    updated_at: assignment.updatedAt,
  }, { status: 201 });
}
