"""
Chatbot AI service — Gemini integration with smart local fallback.
"""

import logging
import time
from django.conf import settings
from courses.models import Course, Enrollment, Assignment

logger = logging.getLogger(__name__)

# ─── System Prompt ─────────────────────────────────────────────
SYSTEM_PROMPT = """You are UNIBOT, a smart AI assistant for university students.
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
"""

# ─── Campus Knowledge Base ─────────────────────────────────────
CAMPUS_INFO = {
    "library": {
        "keywords": ["library", "library hours", "books", "study room", "reading"],
        "response": (
            "📚 **University Library Information**\n\n"
            "🕐 **Hours:**\n"
            "- Monday – Friday: 8:00 AM – 10:00 PM\n"
            "- Saturday: 9:00 AM – 6:00 PM\n"
            "- Sunday: 10:00 AM – 5:00 PM\n\n"
            "📍 **Location:** Central Campus, Building A\n"
            "📖 **Services:** Book lending, digital resources, study rooms, printing\n"
            "💻 **Online Catalog:** Available through the student portal\n\n"
            "💡 *Tip: You can reserve study rooms online up to 3 days in advance!*"
        )
    },
    "campus_map": {
        "keywords": ["campus map", "map", "directions", "where is", "location", "building"],
        "response": (
            "🗺️ **Campus Map & Directions**\n\n"
            "Our campus has the following key buildings:\n\n"
            "🏛️ **Main Academic Block** — Lectures & seminars\n"
            "🔬 **Science Complex** — Labs & research facilities\n"
            "📚 **Central Library** — Building A, near the main gate\n"
            "🍽️ **Student Center** — Cafeteria, clubs & recreation\n"
            "🏥 **Health Center** — Near the sports complex\n"
            "🏟️ **Sports Complex** — Gym, courts & swimming pool\n"
            "🅿️ **Parking** — East & West lots available\n\n"
            "📱 *Download the campus app for interactive navigation!*"
        )
    },
    "exam": {
        "keywords": ["exam", "examination", "test", "midterm", "final", "quiz schedule"],
        "response": (
            "📝 **Examination Information**\n\n"
            "📅 **Midterm Exams:** Typically held in Week 8\n"
            "📅 **Final Exams:** Scheduled during the last 2 weeks of the semester\n\n"
            "📋 **Exam Rules:**\n"
            "- Arrive 15 minutes before the exam\n"
            "- Bring your student ID\n"
            "- No electronic devices unless permitted\n"
            "- Check your exam schedule on the student portal\n\n"
            "💡 *Tip: Past exam papers are available in the library's digital collection!*"
        )
    },
    "fees": {
        "keywords": ["fee", "tuition", "payment", "scholarship", "financial aid"],
        "response": (
            "💰 **Fee & Financial Information**\n\n"
            "📋 **Fee Payment:**\n"
            "- Pay online through the student portal\n"
            "- Deadline: Usually within the first 2 weeks of each semester\n"
            "- Late fees may apply after the deadline\n\n"
            "🎓 **Scholarships:**\n"
            "- Merit-based: Top 10% of each department\n"
            "- Need-based: Apply through the financial aid office\n"
            "- Research assistantships available for graduate students\n\n"
            "📍 *Visit the Finance Office (Admin Building, Room 102) for more details.*"
        )
    },
    "hostel": {
        "keywords": ["hostel", "dormitory", "dorm", "accommodation", "room", "mess", "canteen"],
        "response": (
            "🏠 **Hostel & Accommodation**\n\n"
            "🛏️ **Room Types:** Single, Double, and Triple-sharing\n"
            "🍽️ **Mess Timings:**\n"
            "- Breakfast: 7:30 – 9:30 AM\n"
            "- Lunch: 12:30 – 2:30 PM\n"
            "- Dinner: 7:00 – 9:00 PM\n\n"
            "📋 **Rules & Regulations:**\n"
            "- Gate closes at 10:00 PM on weekdays\n"
            "- Weekend gate extension till 11:00 PM\n"
            "- Guests must register at the front desk\n\n"
            "📍 *Contact the Hostel Warden for room change requests.*"
        )
    },
    "attendance": {
        "keywords": ["attendance", "absent", "leave", "medical leave"],
        "response": (
            "📊 **Attendance Policy**\n\n"
            "✅ **Minimum Requirement:** 75% attendance in each course\n"
            "⚠️ **Below 75%:** You may be debarred from the final exam\n\n"
            "📋 **Leave Process:**\n"
            "- Medical leave: Submit a medical certificate within 3 days\n"
            "- Emergency leave: Apply through the student portal\n"
            "- Prior leave: Submit application at least 2 days in advance\n\n"
            "💡 *Track your attendance regularly on the student portal!*"
        )
    },
    "placement": {
        "keywords": ["placement", "job", "career", "interview", "internship", "recruit"],
        "response": (
            "💼 **Placements & Career Services**\n\n"
            "📅 **Placement Season:** September – March\n"
            "📅 **Internship Drive:** April – June\n\n"
            "📋 **Services Available:**\n"
            "- Resume review & mock interviews\n"
            "- Company presentations & workshops\n"
            "- Coding practice sessions\n"
            "- Soft skills training\n\n"
            "🌟 **Top Recruiters:** Google, Microsoft, Amazon, TCS, Infosys, and more\n\n"
            "📍 *Visit the Training & Placement Cell (TPO Block) or check the portal.*"
        )
    },
    "reminder": {
        "keywords": ["set reminder", "remind me", "reminder"],
        "response": (
            "⏰ **Reminder Feature**\n\n"
            "I can help you stay on track! Here are some tips:\n\n"
            "📋 **Upcoming Deadlines:**\n"
            "- Check the 'Assignments' tab for due dates\n"
            "- Enable notifications in your student portal\n\n"
            "💡 *Tip: Write your deadlines in the Schedule tab to keep track!*\n\n"
            "Want me to show your upcoming assignment deadlines instead?"
        )
    },
}


def build_context(user):
    """
    Build rich course context from the student's enrolled courses,
    syllabi, and assignments for the AI to reference.
    """
    context_parts = []

    enrollments = Enrollment.objects.filter(
        student=user
    ).select_related('course', 'course__faculty')

    if enrollments.exists():
        context_parts.append("=== Student's Enrolled Courses ===")
        for enrollment in enrollments:
            course = enrollment.course
            faculty_name = (
                course.faculty.get_full_name()
                if course.faculty else 'TBA'
            )
            context_parts.append(
                f"\n📚 {course.code} — {course.name}\n"
                f"   Department: {course.department}\n"
                f"   Faculty: {faculty_name}\n"
                f"   Description: {course.description}\n"
                f"   Syllabus: {course.syllabus or 'Not yet uploaded'}\n"
            )

            # Include assignments
            assignments = course.assignments.all().order_by('due_date')[:5]
            if assignments:
                context_parts.append("   Assignments:")
                for a in assignments:
                    due = a.due_date.strftime('%Y-%m-%d %H:%M') if a.due_date else 'No due date'
                    context_parts.append(
                        f"   - {a.title} (Due: {due})"
                    )
    else:
        context_parts.append(
            "The student is not currently enrolled in any courses."
        )

    return "\n".join(context_parts)


def get_ai_response(user_message: str, user) -> str:
    """
    Sends the student's message to Google Gemini along with course context.
    Falls back to smart local responses if Gemini is unavailable.
    """
    # First, check if it's a campus info question (instant, no API needed)
    campus_answer = _check_campus_info(user_message)
    if campus_answer:
        return campus_answer

    # Try Gemini API
    try:
        import google.generativeai as genai

        api_key = getattr(settings, 'GEMINI_API_KEY', None)
        if not api_key or api_key.startswith('your-'):
            logger.info("No valid Gemini API key configured, using local fallback.")
            return _smart_fallback(user_message, user)

        genai.configure(api_key=api_key)
        context = build_context(user)

        # Merge system prompt + context
        instruction = f"{SYSTEM_PROMPT}\n\nCourse Context:\n{context}"

        # Try multiple model names for compatibility
        model_names = ['gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-pro']

        last_error = None
        for model_name in model_names:
            try:
                model = genai.GenerativeModel(
                    model_name=model_name,
                    system_instruction=instruction,
                )
                response = model.generate_content(
                    user_message,
                    generation_config=genai.GenerationConfig(
                        temperature=0.7,
                        max_output_tokens=800,
                    ),
                )
                result = response.text.strip()
                if result:
                    logger.info(f"Gemini response via {model_name} successful.")
                    return result
            except Exception as model_err:
                last_error = model_err
                err_msg = str(model_err).lower()
                if '429' in str(model_err) or 'quota' in err_msg or 'rate' in err_msg:
                    logger.warning(f"Rate limited on {model_name}, trying next model...")
                    continue
                elif '404' in str(model_err) or 'not found' in err_msg:
                    logger.warning(f"Model {model_name} not found, trying next...")
                    continue
                else:
                    logger.error(f"Gemini error with {model_name}: {model_err}")
                    break

        # If all models failed, use smart fallback
        logger.warning(f"All Gemini models failed. Last error: {last_error}. Using fallback.")
        return _smart_fallback(user_message, user)

    except ImportError:
        logger.error("google-generativeai package not installed.")
        return _smart_fallback(user_message, user)
    except Exception as e:
        logger.error(f"Unexpected Gemini error: {e}")
        return _smart_fallback(user_message, user)


def _check_campus_info(message: str) -> str | None:
    """
    Check if the message matches any campus info topic.
    Returns a pre-built response or None.
    """
    message_lower = message.lower().strip()

    for topic_key, topic_data in CAMPUS_INFO.items():
        for keyword in topic_data["keywords"]:
            if keyword in message_lower:
                return topic_data["response"]

    return None


def _smart_fallback(message: str, user) -> str:
    """
    Intelligent fallback when Gemini API is unavailable.
    Uses course data from the database to answer questions accurately.
    """
    message_lower = message.lower().strip()

    enrollments = Enrollment.objects.filter(
        student=user
    ).select_related('course', 'course__faculty')

    # ─── Greeting ──────────────────────────────────────────
    if any(word in message_lower for word in ['hello', 'hi', 'hey', 'good morning',
                                               'good afternoon', 'good evening']):
        name = user.first_name or user.username
        enrolled_count = enrollments.count()
        assignments_count = Assignment.objects.filter(
            course__enrollments__student=user
        ).count()

        return (
            f"Hey {name}! 👋 Welcome to UNIBOT!\n\n"
            f"Here's a quick snapshot:\n"
            f"- 📚 You're enrolled in **{enrolled_count} course(s)**\n"
            f"- 📝 You have **{assignments_count} assignment(s)**\n\n"
            f"I can help you with:\n"
            f"- 📚 Course info & syllabi\n"
            f"- 📝 Assignment deadlines\n"
            f"- 🏫 Campus information (library, exams, fees, etc.)\n"
            f"- 🗓️ Schedules & procedures\n\n"
            f"Try asking: *\"What courses am I enrolled in?\"* or *\"Show me upcoming deadlines\"*"
        )

    # ─── Courses ───────────────────────────────────────────
    if any(word in message_lower for word in ['course', 'enrolled', 'classes', 'subjects',
                                               'what am i taking', 'my courses']):
        if enrollments.exists():
            course_list = "\n".join(
                f"- 📚 **{e.course.code}** — {e.course.name} "
                f"(Faculty: {e.course.faculty.get_full_name() if e.course.faculty else 'TBA'})"
                for e in enrollments
            )
            return (
                f"📚 **Your Enrolled Courses ({enrollments.count()}):**\n\n"
                f"{course_list}\n\n"
                f"Would you like to see the syllabus for any course? "
                f"Just ask: *\"Show syllabus for [course code]\"*"
            )
        return (
            "📭 You don't appear to be enrolled in any courses yet.\n\n"
            "Please contact your department or the registrar's office for enrollment.\n"
            "📍 *Registrar's Office: Admin Building, Room 101*"
        )

    # ─── Syllabus ──────────────────────────────────────────
    if any(word in message_lower for word in ['syllabus', 'curriculum', 'topics',
                                               'what is covered', 'course content']):
        # Try to find the specific course
        for enrollment in enrollments:
            if (enrollment.course.code.lower() in message_lower or
                    enrollment.course.name.lower() in message_lower):
                syllabus = enrollment.course.syllabus
                if syllabus and syllabus.strip():
                    return (
                        f"📋 **Syllabus — {enrollment.course.code}: {enrollment.course.name}**\n\n"
                        f"{syllabus}\n\n"
                        f"👨‍🏫 Faculty: {enrollment.course.faculty.get_full_name() if enrollment.course.faculty else 'TBA'}"
                    )
                else:
                    return (
                        f"📋 **{enrollment.course.code}: {enrollment.course.name}**\n\n"
                        f"The syllabus has not been uploaded yet by the faculty.\n"
                        f"Please check back later or contact your professor."
                    )

        # No specific course mentioned — show all
        if enrollments.exists():
            lines = []
            for e in enrollments:
                syllabus_status = "✅ Available" if (e.course.syllabus and e.course.syllabus.strip()) else "⏳ Pending"
                lines.append(f"- **{e.course.code}** — {e.course.name} ({syllabus_status})")
            return (
                f"📋 **Your Courses & Syllabus Status:**\n\n"
                f"{chr(10).join(lines)}\n\n"
                f"Tell me a specific course code to see its full syllabus!"
            )

        return "Please specify the course code or name for the syllabus you'd like to see."

    # ─── Assignments / Deadlines ───────────────────────────
    if any(word in message_lower for word in ['assignment', 'homework', 'due', 'deadline',
                                               'submit', 'pending', 'upcoming']):
        assignments = Assignment.objects.filter(
            course__enrollments__student=user
        ).select_related('course').order_by('due_date')[:10]

        if assignments:
            assignment_list = "\n".join(
                f"- 📝 **{a.title}** ({a.course.code}) — "
                f"Due: {a.due_date.strftime('%b %d, %Y at %I:%M %p') if a.due_date else 'TBA'}"
                for a in assignments
            )
            return (
                f"📝 **Your Upcoming Assignments ({assignments.count()}):**\n\n"
                f"{assignment_list}\n\n"
                f"💡 *Tip: Start with the earliest deadline first!*"
            )
        return (
            "✅ **No pending assignments found!**\n\n"
            "You're all caught up! Check back later for new assignments.\n"
            "💡 *Enjoy your free time, but keep reviewing your course materials!*"
        )

    # ─── Grades / Marks ────────────────────────────────────
    if any(word in message_lower for word in ['grade', 'marks', 'score', 'result', 'gpa', 'cgpa']):
        return (
            "📊 **Grades & Results**\n\n"
            "Your grades are available on the student portal:\n\n"
            "📋 **How to check:**\n"
            "1. Log in to the student portal\n"
            "2. Navigate to 'Academic Records' → 'Grade Card'\n"
            "3. Select the semester\n\n"
            "💡 *Results are typically published 2-3 weeks after the exam period.*\n\n"
            "📍 *For grade-related queries, contact the Examination Cell (Admin Block, Room 205).*"
        )

    # ─── Professor / Faculty ───────────────────────────────
    if any(word in message_lower for word in ['professor', 'faculty', 'teacher', 'instructor',
                                               'who teaches']):
        if enrollments.exists():
            faculty_list = "\n".join(
                f"- 👨‍🏫 **{e.course.code}** — {e.course.faculty.get_full_name() if e.course.faculty else 'TBA'} "
                f"({e.course.name})"
                for e in enrollments
            )
            return (
                f"👨‍🏫 **Your Faculty:**\n\n"
                f"{faculty_list}\n\n"
                f"Office hours are typically posted on the course page."
            )
        return "You're not enrolled in any courses yet. Faculty information will be shown after enrollment."

    # ─── Schedule / Timetable ──────────────────────────────
    if any(word in message_lower for word in ['schedule', 'timetable', 'when', 'class time',
                                               'class timing']):
        return (
            "🗓️ **Schedule & Timetable**\n\n"
            "Your class schedule is available in the **Schedule** tab on the sidebar.\n\n"
            "📋 **General Class Timings:**\n"
            "- Morning sessions: 8:00 AM – 12:00 PM\n"
            "- Afternoon sessions: 1:00 PM – 5:00 PM\n"
            "- Lab sessions: As per your course requirements\n\n"
            "💡 *Check the Schedule tab for your personalized timetable!*"
        )

    # ─── Help ──────────────────────────────────────────────
    if any(word in message_lower for word in ['help', 'what can you do', 'features', 'how to use']):
        return (
            "🤖 **I'm UNIBOT — Your 24/7 University Assistant!**\n\n"
            "Here's everything I can help with:\n\n"
            "📚 **Academic:**\n"
            "- Course information & syllabi\n"
            "- Assignment deadlines\n"
            "- Grade & result queries\n"
            "- Faculty information\n\n"
            "🏫 **Campus:**\n"
            "- Library hours & services\n"
            "- Campus map & directions\n"
            "- Exam information\n"
            "- Hostel & mess details\n"
            "- Fee payments & scholarships\n"
            "- Placement & career services\n"
            "- Attendance policy\n\n"
            "💬 **Try these queries:**\n"
            "- *\"What courses am I enrolled in?\"*\n"
            "- *\"Show me the syllabus for CS101\"*\n"
            "- *\"When is my assignment due?\"*\n"
            "- *\"What are the library hours?\"*\n"
            "- *\"Tell me about placements\"*"
        )

    # ─── Thanks ────────────────────────────────────────────
    if any(word in message_lower for word in ['thank', 'thanks', 'appreciate']):
        name = user.first_name or user.username
        return (
            f"You're welcome, {name}! 😊\n\n"
            f"I'm always here to help. Feel free to ask me anything!\n"
            f"🎓 *Have a great day at campus!*"
        )

    # ─── Default — try to be helpful ───────────────────────
    name = user.first_name or user.username
    enrolled_count = enrollments.count()

    return (
        f"🤔 I'm not sure I fully understood your question, {name}.\n\n"
        f"Here are some things I can help with:\n\n"
        f"📚 **Academic:** \"What courses am I enrolled in?\" | \"Show syllabus for CS101\"\n"
        f"📝 **Assignments:** \"What are my upcoming deadlines?\"\n"
        f"🏫 **Campus:** \"Library hours\" | \"Campus map\" | \"Exam info\"\n"
        f"💼 **Career:** \"Tell me about placements\" | \"Internship info\"\n"
        f"📊 **Grades:** \"Check my grades\" | \"How to see results\"\n\n"
        f"💡 *Try rephrasing your question, or type **'help'** to see all my features!*"
    )
