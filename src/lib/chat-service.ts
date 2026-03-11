import { prisma } from "./prisma";
import Groq from "groq-sdk";
import type { Enrollment, Course, User, Assignment } from "@prisma/client";

// ─── System Prompt ─────────────────────────────────────────────
const SYSTEM_PROMPT = `You are UNIBOT, a smart AI assistant for university students.
You help students with:
- Course details, syllabi, and schedules
- Assignment information and deadlines
- Administrative procedures and campus information
- General academic guidance

Rules:
1. Be helpful, concise, and student-friendly.
2. If course-specific data is provided in the context, USE it to give accurate, data-driven answers.
3. When listing courses/assignments, format them clearly with emojis and bullet points.
4. Always be encouraging and supportive of students' academic journeys.
5. If the student asks about something outside the provided context, give a general helpful answer and suggest they verify with their department.
6. Use markdown formatting (bold, bullet points) for readability.
`;

// ─── Campus Knowledge Base ─────────────────────────────────────
const CAMPUS_INFO: Record<string, { keywords: string[]; response: string }> = {
  library: {
    keywords: ["library", "library hours", "books", "study room", "reading"],
    response:
      "📚 **University Library Information**\n\n" +
      "🕐 **Hours:**\n" +
      "- Monday – Friday: 8:00 AM – 10:00 PM\n" +
      "- Saturday: 9:00 AM – 6:00 PM\n" +
      "- Sunday: 10:00 AM – 5:00 PM\n\n" +
      "📍 **Location:** Central Campus, Building A\n" +
      "📖 **Services:** Book lending, digital resources, study rooms, printing\n" +
      "💻 **Online Catalog:** Available through the student portal\n\n" +
      "💡 *Tip: You can reserve study rooms online up to 3 days in advance!*",
  },
  campus_map: {
    keywords: ["campus map", "map", "directions", "where is", "location", "building"],
    response:
      "🗺️ **Campus Map & Directions**\n\n" +
      "Our campus has the following key buildings:\n\n" +
      "🏛️ **Main Academic Block** — Lectures & seminars\n" +
      "🔬 **Science Complex** — Labs & research facilities\n" +
      "📚 **Central Library** — Building A, near the main gate\n" +
      "🍽️ **Student Center** — Cafeteria, clubs & recreation\n" +
      "🏥 **Health Center** — Near the sports complex\n" +
      "🏟️ **Sports Complex** — Gym, courts & swimming pool\n" +
      "🅿️ **Parking** — East & West lots available\n\n" +
      "📱 *Download the campus app for interactive navigation!*",
  },
  exam: {
    keywords: ["exam", "examination", "test", "midterm", "final", "quiz schedule"],
    response:
      "📝 **Examination Information**\n\n" +
      "📅 **Midterm Exams:** Typically held in Week 8\n" +
      "📅 **Final Exams:** Scheduled during the last 2 weeks of the semester\n\n" +
      "📋 **Exam Rules:**\n" +
      "- Arrive 15 minutes before the exam\n" +
      "- Bring your student ID\n" +
      "- No electronic devices unless permitted\n" +
      "- Check your exam schedule on the student portal\n\n" +
      "💡 *Tip: Past exam papers are available in the library's digital collection!*",
  },
  fees: {
    keywords: ["fee", "tuition", "payment", "scholarship", "financial aid"],
    response:
      "💰 **Fee & Financial Information**\n\n" +
      "📋 **Fee Payment:**\n" +
      "- Pay online through the student portal\n" +
      "- Deadline: Usually within the first 2 weeks of each semester\n" +
      "- Late fees may apply after the deadline\n\n" +
      "🎓 **Scholarships:**\n" +
      "- Merit-based: Top 10% of each department\n" +
      "- Need-based: Apply through the financial aid office\n" +
      "- Research assistantships available for graduate students\n\n" +
      "📍 *Visit the Finance Office (Admin Building, Room 102) for more details.*",
  },
  hostel: {
    keywords: ["hostel", "dormitory", "dorm", "accommodation", "room", "mess", "canteen"],
    response:
      "🏠 **Hostel & Accommodation**\n\n" +
      "🛏️ **Room Types:** Single, Double, and Triple-sharing\n" +
      "🍽️ **Mess Timings:**\n" +
      "- Breakfast: 7:30 – 9:30 AM\n" +
      "- Lunch: 12:30 – 2:30 PM\n" +
      "- Dinner: 7:00 – 9:00 PM\n\n" +
      "📋 **Rules & Regulations:**\n" +
      "- Gate closes at 10:00 PM on weekdays\n" +
      "- Weekend gate extension till 11:00 PM\n" +
      "- Guests must register at the front desk\n\n" +
      "📍 *Contact the Hostel Warden for room change requests.*",
  },
  attendance: {
    keywords: ["attendance", "absent", "leave", "medical leave"],
    response:
      "📊 **Attendance Policy**\n\n" +
      "✅ **Minimum Requirement:** 75% attendance in each course\n" +
      "⚠️ **Below 75%:** You may be debarred from the final exam\n\n" +
      "📋 **Leave Process:**\n" +
      "- Medical leave: Submit a medical certificate within 3 days\n" +
      "- Emergency leave: Apply through the student portal\n" +
      "- Prior leave: Submit application at least 2 days in advance\n\n" +
      "💡 *Track your attendance regularly on the student portal!*",
  },
  placement: {
    keywords: ["placement", "job", "career", "interview", "internship", "recruit"],
    response:
      "💼 **Placements & Career Services**\n\n" +
      "📅 **Placement Season:** September – March\n" +
      "📅 **Internship Drive:** April – June\n\n" +
      "📋 **Services Available:**\n" +
      "- Resume review & mock interviews\n" +
      "- Company presentations & workshops\n" +
      "- Coding practice sessions\n" +
      "- Soft skills training\n\n" +
      "🌟 **Top Recruiters:** Google, Microsoft, Amazon, TCS, Infosys, and more\n\n" +
      "📍 *Visit the Training & Placement Cell (TPO Block) or check the portal.*",
  },
  reminder: {
    keywords: ["set reminder", "remind me", "reminder"],
    response:
      "⏰ **Reminder Feature**\n\n" +
      "I can help you stay on track! Here are some tips:\n\n" +
      "📋 **Upcoming Deadlines:**\n" +
      "- Check the 'Assignments' tab for due dates\n" +
      "- Enable notifications in your student portal\n\n" +
      "💡 *Tip: Write your deadlines in the Schedule tab to keep track!*\n\n" +
      "Want me to show your upcoming assignment deadlines instead?",
  },
};

async function buildContext(userId: number): Promise<string> {
  const parts: string[] = [];

  const enrollments = await prisma.enrollment.findMany({
    where: { studentId: userId },
    include: {
      course: {
        include: {
          faculty: true,
          assignments: { orderBy: { dueDate: "asc" }, take: 5 },
        },
      },
    },
  });

  if (enrollments.length > 0) {
    parts.push("=== Student's Enrolled Courses ===");
    for (const enrollment of enrollments) {
      const course = enrollment.course;
      const facultyName = course.faculty
        ? `${course.faculty.firstName} ${course.faculty.lastName}`.trim()
        : "TBA";
      parts.push(
        `\n📚 ${course.code} — ${course.name}\n` +
          `   Department: ${course.department}\n` +
          `   Faculty: ${facultyName}\n` +
          `   Description: ${course.description}\n` +
          `   Syllabus: ${course.syllabus || "Not yet uploaded"}\n`
      );

      if (course.assignments.length > 0) {
        parts.push("   Assignments:");
        for (const a of course.assignments) {
          const due = a.dueDate
            ? a.dueDate.toISOString().slice(0, 16).replace("T", " ")
            : "No due date";
          parts.push(`   - ${a.title} (Due: ${due})`);
        }
      }
    }
  } else {
    parts.push("The student is not currently enrolled in any courses.");
  }

  return parts.join("\n");
}

function checkCampusInfo(message: string): string | null {
  const lower = message.toLowerCase().trim();
  for (const topic of Object.values(CAMPUS_INFO)) {
    for (const kw of topic.keywords) {
      if (lower.includes(kw)) return topic.response;
    }
  }
  return null;
}

async function smartFallback(message: string, userId: number, userName: string): Promise<string> {
  const lower = message.toLowerCase().trim();

  const enrollments = await prisma.enrollment.findMany({
    where: { studentId: userId },
    include: {
      course: { include: { faculty: true } },
    },
  });

  // Greeting
  if (["hello", "hi", "hey", "good morning", "good afternoon", "good evening"].some((w) => lower.includes(w))) {
    const assignmentCount = await prisma.assignment.count({
      where: { course: { enrollments: { some: { studentId: userId } } } },
    });
    return (
      `Hey ${userName}! 👋 Welcome to UNIBOT!\n\n` +
      `Here's a quick snapshot:\n` +
      `- 📚 You're enrolled in **${enrollments.length} course(s)**\n` +
      `- 📝 You have **${assignmentCount} assignment(s)**\n\n` +
      `I can help you with:\n` +
      `- 📚 Course info & syllabi\n` +
      `- 📝 Assignment deadlines\n` +
      `- 🏫 Campus information (library, exams, fees, etc.)\n` +
      `- 🗓️ Schedules & procedures\n\n` +
      `Try asking: *"What courses am I enrolled in?"* or *"Show me upcoming deadlines"*`
    );
  }

  // Courses
  if (["course", "enrolled", "classes", "subjects", "what am i taking", "my courses"].some((w) => lower.includes(w))) {
    if (enrollments.length > 0) {
      const list = enrollments
        .map((e: Enrollment & { course: Course & { faculty: User | null } }) => {
          const fn = e.course.faculty ? `${e.course.faculty.firstName} ${e.course.faculty.lastName}`.trim() : "TBA";
          return `- 📚 **${e.course.code}** — ${e.course.name} (Faculty: ${fn})`;
        })
        .join("\n");
      return (
        `📚 **Your Enrolled Courses (${enrollments.length}):**\n\n` +
        `${list}\n\n` +
        `Would you like to see the syllabus for any course? Just ask: *"Show syllabus for [course code]"*`
      );
    }
    return (
      "📭 You don't appear to be enrolled in any courses yet.\n\n" +
      "Please contact your department or the registrar's office for enrollment.\n" +
      "📍 *Registrar's Office: Admin Building, Room 101*"
    );
  }

  // Syllabus
  if (["syllabus", "curriculum", "topics", "what is covered", "course content"].some((w) => lower.includes(w))) {
    for (const enrollment of enrollments) {
      if (lower.includes(enrollment.course.code.toLowerCase()) || lower.includes(enrollment.course.name.toLowerCase())) {
        const syllabus = enrollment.course.syllabus;
        const fn = enrollment.course.faculty ? `${enrollment.course.faculty.firstName} ${enrollment.course.faculty.lastName}`.trim() : "TBA";
        if (syllabus && syllabus.trim()) {
          return `📋 **Syllabus — ${enrollment.course.code}: ${enrollment.course.name}**\n\n${syllabus}\n\n👨‍🏫 Faculty: ${fn}`;
        }
        return `📋 **${enrollment.course.code}: ${enrollment.course.name}**\n\nThe syllabus has not been uploaded yet by the faculty.\nPlease check back later or contact your professor.`;
      }
    }
    if (enrollments.length > 0) {
      const lines = enrollments.map((e: Enrollment & { course: Course & { faculty: User | null } }) => {
        const status = e.course.syllabus?.trim() ? "✅ Available" : "⏳ Pending";
        return `- **${e.course.code}** — ${e.course.name} (${status})`;
      });
      return `📋 **Your Courses & Syllabus Status:**\n\n${lines.join("\n")}\n\nTell me a specific course code to see its full syllabus!`;
    }
    return "Please specify the course code or name for the syllabus you'd like to see.";
  }

  // Assignments / Deadlines
  if (["assignment", "homework", "due", "deadline", "submit", "pending", "upcoming"].some((w) => lower.includes(w))) {
    const assignments = await prisma.assignment.findMany({
      where: { course: { enrollments: { some: { studentId: userId } } } },
      include: { course: true },
      orderBy: { dueDate: "asc" },
      take: 10,
    });
    if (assignments.length > 0) {
      const list = assignments
        .map((a: Assignment & { course: Course }) => {
          const due = a.dueDate
            ? a.dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
            : "TBA";
          return `- 📝 **${a.title}** (${a.course.code}) — Due: ${due}`;
        })
        .join("\n");
      return `📝 **Your Upcoming Assignments (${assignments.length}):**\n\n${list}\n\n💡 *Tip: Start with the earliest deadline first!*`;
    }
    return "✅ **No pending assignments found!**\n\nYou're all caught up! Check back later for new assignments.\n💡 *Enjoy your free time, but keep reviewing your course materials!*";
  }

  // Grades
  if (["grade", "marks", "score", "result", "gpa", "cgpa"].some((w) => lower.includes(w))) {
    return (
      "📊 **Grades & Results**\n\n" +
      "Your grades are available on the student portal:\n\n" +
      "📋 **How to check:**\n" +
      "1. Log in to the student portal\n" +
      '2. Navigate to \'Academic Records\' → \'Grade Card\'\n' +
      "3. Select the semester\n\n" +
      "💡 *Results are typically published 2-3 weeks after the exam period.*\n\n" +
      "📍 *For grade-related queries, contact the Examination Cell (Admin Block, Room 205).*"
    );
  }

  // Faculty
  if (["professor", "faculty", "teacher", "instructor", "who teaches"].some((w) => lower.includes(w))) {
    if (enrollments.length > 0) {
      const list = enrollments
        .map((e: Enrollment & { course: Course & { faculty: User | null } }) => {
          const fn = e.course.faculty ? `${e.course.faculty.firstName} ${e.course.faculty.lastName}`.trim() : "TBA";
          return `- 👨‍🏫 **${e.course.code}** — ${fn} (${e.course.name})`;
        })
        .join("\n");
      return `👨‍🏫 **Your Faculty:**\n\n${list}\n\nOffice hours are typically posted on the course page.`;
    }
    return "You're not enrolled in any courses yet. Faculty information will be shown after enrollment.";
  }

  // Schedule
  if (["schedule", "timetable", "when", "class time", "class timing"].some((w) => lower.includes(w))) {
    return (
      "🗓️ **Schedule & Timetable**\n\n" +
      "Your class schedule is available in the **Schedule** tab on the sidebar.\n\n" +
      "📋 **General Class Timings:**\n" +
      "- Morning sessions: 8:00 AM – 12:00 PM\n" +
      "- Afternoon sessions: 1:00 PM – 5:00 PM\n" +
      "- Lab sessions: As per your course requirements\n\n" +
      "💡 *Check the Schedule tab for your personalized timetable!*"
    );
  }

  // Help
  if (["help", "what can you do", "features", "how to use"].some((w) => lower.includes(w))) {
    return (
      "🤖 **I'm UNIBOT — Your 24/7 University Assistant!**\n\n" +
      "Here's everything I can help with:\n\n" +
      "📚 **Academic:**\n" +
      "- Course information & syllabi\n" +
      "- Assignment deadlines\n" +
      "- Grade & result queries\n" +
      "- Faculty information\n\n" +
      "🏫 **Campus:**\n" +
      "- Library hours & services\n" +
      "- Campus map & directions\n" +
      "- Exam information\n" +
      "- Hostel & mess details\n" +
      "- Fee payments & scholarships\n" +
      "- Placement & career services\n" +
      "- Attendance policy\n\n" +
      "💬 **Try these queries:**\n" +
      '- *"What courses am I enrolled in?"*\n' +
      '- *"Show me the syllabus for CS101"*\n' +
      '- *"When is my assignment due?"*\n' +
      '- *"What are the library hours?"*\n' +
      '- *"Tell me about placements"*'
    );
  }

  // Thanks
  if (["thank", "thanks", "appreciate"].some((w) => lower.includes(w))) {
    return `You're welcome, ${userName}! 😊\n\nI'm always here to help. Feel free to ask me anything!\n🎓 *Have a great day at campus!*`;
  }

  // Default
  return (
    `🤔 I'm not sure I fully understood your question, ${userName}.\n\n` +
    `Here are some things I can help with:\n\n` +
    `📚 **Academic:** "What courses am I enrolled in?" | "Show syllabus for CS101"\n` +
    `📝 **Assignments:** "What are my upcoming deadlines?"\n` +
    `🏫 **Campus:** "Library hours" | "Campus map" | "Exam info"\n` +
    `💼 **Career:** "Tell me about placements" | "Internship info"\n` +
    `📊 **Grades:** "Check my grades" | "How to see results"\n\n` +
    `💡 *Try rephrasing your question, or type **'help'** to see all my features!*`
  );
}

export async function getAiResponse(userMessage: string, userId: number, userName: string): Promise<string> {
  // Check campus info first (instant, no API)
  const campusAnswer = checkCampusInfo(userMessage);
  if (campusAnswer) return campusAnswer;

  // Try Groq API
  try {
    const apiKey = process.env.GROQ_API_KEY || "";
    if (!apiKey || apiKey.startsWith("your-")) {
      return smartFallback(userMessage, userId, userName);
    }

    const client = new Groq({ apiKey });
    const context = await buildContext(userId);
    const instruction = `${SYSTEM_PROMPT}\n\nCourse Context:\n${context}`;

    const chatCompletion = await client.chat.completions.create({
      messages: [
        { role: "system", content: instruction },
        { role: "user", content: userMessage },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_completion_tokens: 800,
    });

    const result = chatCompletion.choices[0]?.message?.content;
    if (result) return result.trim();
    return smartFallback(userMessage, userId, userName);
  } catch (e) {
    console.error("Groq API error:", e);
    return smartFallback(userMessage, userId, userName);
  }
}
