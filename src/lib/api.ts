/**
 * UNIBOT API Client — role-based, no authentication required.
 */

const API_BASE = '/api';

export function getRole(): 'student' | 'faculty' {
    if (typeof window === 'undefined') return 'student';
    const r = localStorage.getItem('unibot_role');
    return (r === 'student' || r === 'faculty') ? r : 'student';
}

export function setRole(role: 'student' | 'faculty') {
    localStorage.setItem('unibot_role', role);
}

// ─── Fetch Wrapper ───────────────────────────────────────────

async function apiFetch(
    endpoint: string,
    options: RequestInit = {}
): Promise<Response> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-demo-role': getRole(),
        ...(options.headers as Record<string, string>),
    };
    return fetch(`${API_BASE}${endpoint}`, { ...options, headers });
}

// ─── Chat API ────────────────────────────────────────────────

export async function sendMessage(message: string) {
    const res = await apiFetch('/chat', {
        method: 'POST',
        body: JSON.stringify({ message }),
    });
    if (!res.ok) throw new Error('Failed to send message');
    return res.json();
}

export async function getChatHistory() {
    const res = await apiFetch('/chat/history');
    if (!res.ok) throw new Error('Failed to fetch history');
    return res.json();
}

// ─── Courses API ─────────────────────────────────────────────

export async function getCourses() {
    const res = await apiFetch('/courses');
    if (!res.ok) throw new Error('Failed to fetch courses');
    return res.json();
}

export async function getCourse(id: number) {
    const res = await apiFetch(`/courses/${id}`);
    if (!res.ok) throw new Error('Failed to fetch course');
    return res.json();
}

export async function getEnrollments() {
    const res = await apiFetch('/courses/enrollments');
    if (!res.ok) throw new Error('Failed to fetch enrollments');
    return res.json();
}

export async function updateSyllabus(courseId: number, syllabus: string) {
    const res = await apiFetch('/courses/faculty/update-syllabus', {
        method: 'POST',
        body: JSON.stringify({ course_id: courseId, syllabus }),
    });
    if (!res.ok) throw new Error('Failed to update syllabus');
    return res.json();
}

export async function getAssignments() {
    const res = await apiFetch('/courses/faculty/assignments');
    if (!res.ok) throw new Error('Failed to fetch assignments');
    return res.json();
}

export async function createAssignment(data: {
    course: number;
    title: string;
    content: string;
    due_date?: string;
}) {
    const res = await apiFetch('/courses/faculty/assignments', {
        method: 'POST',
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create assignment');
    return res.json();
}

export async function submitFeedback(comment: string, rating: number) {
    const res = await apiFetch('/courses/feedback', {
        method: 'POST',
        body: JSON.stringify({ comment, rating }),
    });
    if (!res.ok) throw new Error('Failed to submit feedback');
    return res.json();
}
