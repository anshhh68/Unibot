import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding UNIBOT database...");

  // ─── Create Users ─────────────────────────────────────────────
  const adminPassword = await bcrypt.hash("admin123", 12);
  const facultyPassword = await bcrypt.hash("faculty123", 12);
  const studentPassword = await bcrypt.hash("student123", 12);

  await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      email: "admin@unibot.edu",
      password: adminPassword,
      firstName: "Admin",
      lastName: "User",
      role: "admin",
    },
  });

  const faculty1 = await prisma.user.upsert({
    where: { username: "prof_sharma" },
    update: {},
    create: {
      username: "prof_sharma",
      email: "sharma@unibot.edu",
      password: facultyPassword,
      firstName: "Dr. Priya",
      lastName: "Sharma",
      role: "faculty",
      department: "Computer Science",
    },
  });

  const faculty2 = await prisma.user.upsert({
    where: { username: "prof_kumar" },
    update: {},
    create: {
      username: "prof_kumar",
      email: "kumar@unibot.edu",
      password: facultyPassword,
      firstName: "Dr. Rajesh",
      lastName: "Kumar",
      role: "faculty",
      department: "Mathematics",
    },
  });

  const student1 = await prisma.user.upsert({
    where: { username: "student1" },
    update: {},
    create: {
      username: "student1",
      email: "student1@unibot.edu",
      password: studentPassword,
      firstName: "Ansh",
      lastName: "Patel",
      role: "student",
      department: "Computer Science",
    },
  });

  const student2 = await prisma.user.upsert({
    where: { username: "student2" },
    update: {},
    create: {
      username: "student2",
      email: "student2@unibot.edu",
      password: studentPassword,
      firstName: "Riya",
      lastName: "Singh",
      role: "student",
      department: "Computer Science",
    },
  });

  console.log("✅ Users created");

  // ─── Create Courses ───────────────────────────────────────────
  const cs101 = await prisma.course.upsert({
    where: { code: "CS101" },
    update: {},
    create: {
      name: "Introduction to Computer Science",
      code: "CS101",
      department: "Computer Science",
      facultyId: faculty1.id,
      description: "Fundamentals of programming, algorithms, and data structures.",
      syllabus:
        "Week 1-2: Introduction to Programming (Python)\n" +
        "Week 3-4: Control Structures & Functions\n" +
        "Week 5-6: Data Structures (Arrays, Lists, Stacks)\n" +
        "Week 7-8: Object-Oriented Programming\n" +
        "Week 9-10: Algorithms & Complexity\n" +
        "Week 11-12: Database Basics\n" +
        "Week 13-14: Web Development Introduction\n" +
        "Week 15-16: Final Project & Review",
    },
  });

  const cs201 = await prisma.course.upsert({
    where: { code: "CS201" },
    update: {},
    create: {
      name: "Data Structures & Algorithms",
      code: "CS201",
      department: "Computer Science",
      facultyId: faculty1.id,
      description: "Advanced data structures, sorting algorithms, and graph theory.",
      syllabus:
        "Week 1-2: Advanced Arrays & Linked Lists\n" +
        "Week 3-4: Trees & Binary Search Trees\n" +
        "Week 5-6: Heaps & Priority Queues\n" +
        "Week 7-8: Hash Tables & Hashing\n" +
        "Week 9-10: Graph Algorithms (BFS, DFS)\n" +
        "Week 11-12: Sorting Algorithms\n" +
        "Week 13-14: Dynamic Programming\n" +
        "Week 15-16: Final Exam Prep",
    },
  });

  const math101 = await prisma.course.upsert({
    where: { code: "MATH101" },
    update: {},
    create: {
      name: "Calculus I",
      code: "MATH101",
      department: "Mathematics",
      facultyId: faculty2.id,
      description: "Limits, derivatives, and integrals.",
      syllabus:
        "Week 1-2: Limits and Continuity\n" +
        "Week 3-4: Derivatives and Rules\n" +
        "Week 5-6: Applications of Derivatives\n" +
        "Week 7-8: Integration Basics\n" +
        "Week 9-10: Techniques of Integration\n" +
        "Week 11-12: Applications of Integrals\n" +
        "Week 13-14: Sequences and Series\n" +
        "Week 15-16: Review & Final Exam",
    },
  });

  console.log("✅ Courses created");

  // ─── Create Enrollments ──────────────────────────────────────
  const enrollmentData = [
    { studentId: student1.id, courseId: cs101.id, enrollmentNum: "ENR-2024-001" },
    { studentId: student1.id, courseId: cs201.id, enrollmentNum: "ENR-2024-002" },
    { studentId: student1.id, courseId: math101.id, enrollmentNum: "ENR-2024-003" },
    { studentId: student2.id, courseId: cs101.id, enrollmentNum: "ENR-2024-004" },
    { studentId: student2.id, courseId: math101.id, enrollmentNum: "ENR-2024-005" },
  ];

  for (const e of enrollmentData) {
    await prisma.enrollment.upsert({
      where: { enrollmentNum: e.enrollmentNum },
      update: {},
      create: e,
    });
  }

  console.log("✅ Enrollments created");

  // ─── Create Assignments ──────────────────────────────────────
  const now = new Date();
  const assignmentData = [
    {
      title: "Python Basics Lab",
      courseId: cs101.id,
      facultyId: faculty1.id,
      content: "Complete exercises 1-10 from Chapter 3. Submit as .py files.",
      dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Binary Tree Implementation",
      courseId: cs201.id,
      facultyId: faculty1.id,
      content: "Implement a binary search tree with insert, delete, and traversal operations.",
      dueDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Derivatives Worksheet",
      courseId: math101.id,
      facultyId: faculty2.id,
      content: "Solve problems 1-20 from the derivatives chapter.",
      dueDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
    },
  ];

  for (const a of assignmentData) {
    const existing = await prisma.assignment.findFirst({
      where: { title: a.title, courseId: a.courseId },
    });
    if (!existing) {
      await prisma.assignment.create({ data: a });
    }
  }

  console.log("✅ Assignments created");
  console.log("🎉 Seeding complete!");
  console.log("\n📋 Login credentials:");
  console.log("   Admin:   admin / admin123");
  console.log("   Faculty: prof_sharma / faculty123");
  console.log("   Faculty: prof_kumar / faculty123");
  console.log("   Student: student1 / student123");
  console.log("   Student: student2 / student123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
