import { GoogleGenerativeAI } from "@google/generative-ai";

// ─── System Prompt ─────────────────────────────────────────────
const SYSTEM_PROMPT = `You are UNIBOT, a smart and friendly AI assistant for university students and faculty.
You help with:
- Course details, syllabi, and schedules
- Assignment information and deadlines
- Administrative procedures and campus information
- General academic guidance

Rules:
1. Be helpful, concise, and student-friendly.
2. Format responses clearly with emojis and markdown (bold, bullet points).
3. Always be encouraging and supportive of students' academic journeys.
4. For campus-specific questions, give helpful general university guidance.
5. When you don't have specific data, give general helpful answers.
6. Keep responses concise but complete (under 300 words).
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
  grades: {
    keywords: ["grade", "marks", "score", "result", "gpa", "cgpa"],
    response:
      "📊 **Grades & Results**\n\n" +
      "Your grades are available on the student portal:\n\n" +
      "📋 **How to check:**\n" +
      "1. Log in to the student portal\n" +
      "2. Navigate to 'Academic Records' → 'Grade Card'\n" +
      "3. Select the semester\n\n" +
      "💡 *Results are typically published 2-3 weeks after the exam period.*\n\n" +
      "📍 *For grade-related queries, contact the Examination Cell (Admin Block, Room 205).*",
  },
  schedule: {
    keywords: ["schedule", "timetable", "when", "class time", "class timing"],
    response:
      "🗓️ **Schedule & Timetable**\n\n" +
      "Your class schedule is available in the **Schedule** tab on the sidebar.\n\n" +
      "📋 **General Class Timings:**\n" +
      "- Morning sessions: 8:00 AM – 12:00 PM\n" +
      "- Afternoon sessions: 1:00 PM – 5:00 PM\n" +
      "- Lab sessions: As per your course requirements\n\n" +
      "💡 *Check the Schedule tab for your personalized timetable!*",
  },
};

function checkCampusInfo(message: string): string | null {
  const lower = message.toLowerCase().trim();
  for (const topic of Object.values(CAMPUS_INFO)) {
    for (const kw of topic.keywords) {
      if (lower.includes(kw)) return topic.response;
    }
  }
  return null;
}

function getSmartFallback(message: string, userName: string): string {
  const lower = message.toLowerCase().trim();

  if (["hello", "hi", "hey", "good morning", "good afternoon", "good evening"].some((w) => lower.includes(w))) {
    return (
      `Hey ${userName}! 👋 Welcome to UNIBOT!\n\n` +
      `I'm your 24/7 university AI assistant. I can help you with:\n\n` +
      `📚 **Academic:** Course info, syllabi, assignments\n` +
      `🏫 **Campus:** Library, exams, fees, hostel\n` +
      `💼 **Career:** Placements, internships\n` +
      `📊 **Grades & Attendance**\n\n` +
      `Try asking: *"What are the library hours?"* or *"Tell me about placements"*`
    );
  }

  if (["help", "what can you do", "features", "how to use"].some((w) => lower.includes(w))) {
    return (
      "🤖 **I'm UNIBOT — Your 24/7 University Assistant!**\n\n" +
      "Here's everything I can help with:\n\n" +
      "📚 **Academic:** Course info, syllabi, assignment deadlines, grade queries\n" +
      "🏫 **Campus:** Library hours, campus map, exam info, hostel details\n" +
      "💰 **Finance:** Fee payments, scholarships, financial aid\n" +
      "💼 **Career:** Placements, internships, career services\n" +
      "📊 **Academics:** Attendance policy, results\n\n" +
      "💬 **Try these queries:**\n" +
      '- *"What are the library hours?"*\n' +
      '- *"Tell me about exam rules"*\n' +
      '- *"Placement information"*\n' +
      '- *"Hostel mess timings"*'
    );
  }

  if (["thank", "thanks", "appreciate"].some((w) => lower.includes(w))) {
    return `You're welcome, ${userName}! 😊\n\nI'm always here to help. Feel free to ask me anything!\n🎓 *Have a great day at campus!*`;
  }

  return (
    `🤔 I'm not sure I fully understood that, but let me try to help!\n\n` +
    `Here are things I can assist with:\n\n` +
    `📚 **Academic:** "Library hours" | "Exam information"\n` +
    `🏫 **Campus:** "Campus map" | "Hostel details" | "Mess timings"\n` +
    `💼 **Career:** "Tell me about placements" | "Internship info"\n` +
    `💰 **Finance:** "Fee payment" | "Scholarship info"\n\n` +
    `💡 *Type **'help'** to see all my features!*`
  );
}

export async function getAiResponse(userMessage: string, userName: string): Promise<string> {
  // 1. Check campus info first (instant, no API call needed)
  const campusAnswer = checkCampusInfo(userMessage);
  if (campusAnswer) return campusAnswer;

  // 2. Try Gemini API
  try {
    const apiKey = process.env.GEMINI_API_KEY || "";
    if (!apiKey || apiKey.startsWith("your-") || apiKey === "") {
      return getSmartFallback(userMessage, userName);
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: SYSTEM_PROMPT,
    });

    const result = await model.generateContent(userMessage);
    const text = result.response.text();
    if (text && text.trim()) return text.trim();

    return getSmartFallback(userMessage, userName);
  } catch (e) {
    console.error("Gemini API error:", e);
    return getSmartFallback(userMessage, userName);
  }
}
