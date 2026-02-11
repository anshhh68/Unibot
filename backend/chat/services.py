"""
OpenAI service for generating chatbot responses with course context.
"""

import logging
from django.conf import settings
from courses.models import Course, Enrollment

logger = logging.getLogger(__name__)

# System prompt that defines UNIBOT's behavior
SYSTEM_PROMPT = """You are UNIBOT, a smart AI assistant for university students.
You help students with:
- Course details, syllabi, and schedules
- Assignment information and deadlines
- Administrative procedures and campus information
- General academic guidance

When answering, be helpful, concise, and student-friendly.
If course-specific data is provided in the context, use it to give accurate answers.
Always be encouraging and supportive of students' academic journeys.
"""


def build_context(user):
    """
    Build course context from the student's enrolled courses and their syllabi.
    This ensures the bot retrieves the latest data updated by Faculty.
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
                f"   Syllabus: {course.syllabus}\n"
            )

            # Include assignments
            assignments = course.assignments.all()[:5]
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
    Sends the student's message to OpenAI along with course context.
    Returns the AI-generated response text.
    """
    try:
        from openai import OpenAI

        api_key = settings.OPENAI_API_KEY
        if not api_key or api_key == 'your-openai-api-key-here':
            # Fallback for demo/development without API key
            return _demo_response(user_message, user)

        client = OpenAI(api_key=api_key)
        context = build_context(user)

        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "system", "content": f"Course Context:\n{context}"},
            {"role": "user", "content": user_message},
        ]

        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=messages,
            max_tokens=800,
            temperature=0.7,
        )

        return response.choices[0].message.content.strip()

    except Exception as e:
        logger.error(f"OpenAI API error: {e}")
        return _demo_response(user_message, user)


def _demo_response(message: str, user) -> str:
    """
    Fallback response when OpenAI API is not configured.
    Provides meaningful responses based on available course data.
    """
    message_lower = message.lower()

    enrollments = Enrollment.objects.filter(
        student=user
    ).select_related('course')

    if any(word in message_lower for word in ['course', 'enrolled', 'classes', 'subjects']):
        if enrollments.exists():
            course_list = "\n".join(
                f"📚 **{e.course.code}** — {e.course.name}"
                for e in enrollments
            )
            return (
                f"Here are your enrolled courses:\n\n{course_list}\n\n"
                f"Would you like to know more about any specific course?"
            )
        return "You don't seem to be enrolled in any courses yet. Please contact your department for enrollment."

    if any(word in message_lower for word in ['syllabus', 'curriculum', 'topics']):
        for enrollment in enrollments:
            if enrollment.course.code.lower() in message_lower or \
               enrollment.course.name.lower() in message_lower:
                return (
                    f"📋 **Syllabus for {enrollment.course.code} — {enrollment.course.name}:**\n\n"
                    f"{enrollment.course.syllabus or 'Syllabus not yet uploaded by faculty.'}"
                )
        return "Please specify which course's syllabus you'd like to see. You can mention the course code or name."

    if any(word in message_lower for word in ['assignment', 'homework', 'due', 'deadline']):
        from courses.models import Assignment
        assignments = Assignment.objects.filter(
            course__enrollments__student=user
        ).order_by('due_date')[:5]
        if assignments:
            assignment_list = "\n".join(
                f"📝 **{a.title}** ({a.course.code}) — Due: {a.due_date.strftime('%b %d, %Y') if a.due_date else 'TBA'}"
                for a in assignments
            )
            return f"Here are your upcoming assignments:\n\n{assignment_list}"
        return "No assignments found for your enrolled courses."

    if any(word in message_lower for word in ['hello', 'hi', 'hey', 'good']):
        name = user.first_name or user.username
        return (
            f"Hey {name}! 👋 I'm UNIBOT, your university assistant.\n\n"
            f"I can help you with:\n"
            f"• 📚 Course information & syllabi\n"
            f"• 📝 Assignment deadlines\n"
            f"• 🗓️ Schedules & procedures\n\n"
            f"What would you like to know?"
        )

    if any(word in message_lower for word in ['help', 'what can you do', 'features']):
        return (
            "I'm **UNIBOT** — your 24/7 university assistant! Here's what I can do:\n\n"
            "1. 📚 **Course Info** — Ask about your enrolled courses\n"
            "2. 📋 **Syllabi** — View course syllabi updated by faculty\n"
            "3. 📝 **Assignments** — Check upcoming deadlines\n"
            "4. 🏫 **Campus Info** — Administrative procedures\n\n"
            "Try asking: *\"What courses am I enrolled in?\"* or *\"Show me the syllabus for CS101\"*"
        )

    return (
        "I'd be happy to help! You can ask me about:\n"
        "• Your enrolled courses\n"
        "• Course syllabi and content\n"
        "• Assignment deadlines\n"
        "• Campus procedures\n\n"
        "Try being more specific, and I'll give you a detailed answer! 😊"
    )
