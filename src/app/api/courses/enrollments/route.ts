import { NextRequest, NextResponse } from "next/server";
import { getDemoUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const user = await getDemoUser(req);
  if (!user || user.role !== "student") {
    return NextResponse.json({ error: "Student role required." }, { status: 403 });
  }

  const enrollments = await prisma.enrollment.findMany({
    where: { studentId: user.id },
    include: {
      course: {
        include: {
          faculty: { select: { id: true, firstName: true, lastName: true, username: true } },
        },
      },
    },
  });

  const result = enrollments.map((e) => ({
    id: e.id,
    student: e.studentId,
    course: e.courseId,
    course_detail: {
      id: e.course.id,
      name: e.course.name,
      code: e.course.code,
      syllabus: e.course.syllabus,
      description: e.course.description,
      department: e.course.department,
      faculty: e.course.facultyId,
      faculty_name: e.course.faculty
        ? `${e.course.faculty.firstName} ${e.course.faculty.lastName}`.trim() || e.course.faculty.username
        : null,
      created_at: e.course.createdAt,
      updated_at: e.course.updatedAt,
    },
    enrollment_num: e.enrollmentNum,
    enrolled_at: e.enrolledAt,
  }));

  return NextResponse.json(result);
}
