import { NextRequest, NextResponse } from "next/server";
import { getDemoUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const user = await getDemoUser(req);
  if (!user) {
    return NextResponse.json({ error: "Invalid role." }, { status: 400 });
  }

  let courses;

  if (user.role === "student") {
    const enrolledIds = await prisma.enrollment.findMany({
      where: { studentId: user.id },
      select: { courseId: true },
    });
    courses = await prisma.course.findMany({
      where: { id: { in: enrolledIds.map((e: { courseId: number }) => e.courseId) } },
      include: { faculty: { select: { id: true, firstName: true, lastName: true, username: true } } },
      orderBy: { name: "asc" },
    });
  } else if (user.role === "faculty") {
    courses = await prisma.course.findMany({
      where: { facultyId: user.id },
      include: { faculty: { select: { id: true, firstName: true, lastName: true, username: true } } },
      orderBy: { name: "asc" },
    });
  } else {
    courses = await prisma.course.findMany({
      include: { faculty: { select: { id: true, firstName: true, lastName: true, username: true } } },
      orderBy: { name: "asc" },
    });
  }

  const result = courses.map((c: typeof courses[number]) => ({
    id: c.id,
    name: c.name,
    code: c.code,
    syllabus: c.syllabus,
    description: c.description,
    department: c.department,
    faculty: c.facultyId,
    faculty_name: c.faculty
      ? `${c.faculty.firstName} ${c.faculty.lastName}`.trim() || c.faculty.username
      : null,
    created_at: c.createdAt,
    updated_at: c.updatedAt,
  }));

  return NextResponse.json(result);
}
