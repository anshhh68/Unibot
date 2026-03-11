import { NextRequest, NextResponse } from "next/server";
import { getDemoUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const user = await getDemoUser(req);
  if (!user || user.role !== "faculty") {
    return NextResponse.json({ error: "Faculty role required." }, { status: 403 });
  }

  const { course_id, syllabus } = await req.json();

  if (!course_id || syllabus === undefined) {
    return NextResponse.json({ error: "course_id and syllabus are required." }, { status: 400 });
  }

  const course = await prisma.course.findFirst({
    where: { id: course_id, facultyId: user.id },
  });

  if (!course) {
    return NextResponse.json({ error: "Course not found or you are not the assigned faculty." }, { status: 404 });
  }

  const updated = await prisma.course.update({
    where: { id: course_id },
    data: { syllabus },
    include: { faculty: { select: { id: true, firstName: true, lastName: true, username: true } } },
  });

  return NextResponse.json({
    id: updated.id,
    name: updated.name,
    code: updated.code,
    syllabus: updated.syllabus,
    description: updated.description,
    department: updated.department,
    faculty: updated.facultyId,
    faculty_name: updated.faculty
      ? `${updated.faculty.firstName} ${updated.faculty.lastName}`.trim() || updated.faculty.username
      : null,
    created_at: updated.createdAt,
    updated_at: updated.updatedAt,
  });
}
