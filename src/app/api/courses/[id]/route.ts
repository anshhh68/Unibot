import { NextRequest, NextResponse } from "next/server";
import { getDemoUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getDemoUser(req);
  if (!user) {
    return NextResponse.json({ error: "Invalid role." }, { status: 400 });
  }

  const { id } = await params;
  const courseId = parseInt(id, 10);
  if (isNaN(courseId)) {
    return NextResponse.json({ error: "Invalid course ID." }, { status: 400 });
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: { faculty: { select: { id: true, firstName: true, lastName: true, username: true } } },
  });

  if (!course) {
    return NextResponse.json({ error: "Course not found." }, { status: 404 });
  }

  return NextResponse.json({
    id: course.id,
    name: course.name,
    code: course.code,
    syllabus: course.syllabus,
    description: course.description,
    department: course.department,
    faculty: course.facultyId,
    faculty_name: course.faculty
      ? `${course.faculty.firstName} ${course.faculty.lastName}`.trim() || course.faculty.username
      : null,
    created_at: course.createdAt,
    updated_at: course.updatedAt,
  });
}
