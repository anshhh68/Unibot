/**
 * UNIBOT API Client — handles all backend communication.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface TokenPair {
    access: string;
    refresh: string;
}

// ─── Token Management ────────────────────────────────────────

export function getTokens(): TokenPair | null {
    if (typeof window === 'undefined') return null;
    const access = localStorage.getItem('unibot_access');
    const refresh = localStorage.getItem('unibot_refresh');
    if (access && refresh) return { access, refresh };
    return null;
}

export function setTokens(tokens: TokenPair) {
    localStorage.setItem('unibot_access', tokens.access);
    localStorage.setItem('unibot_refresh', tokens.refresh);
}

export function clearTokens() {
    localStorage.removeItem('unibot_access');
    localStorage.removeItem('unibot_refresh');
}

// ─── Fetch Wrapper ───────────────────────────────────────────

async function apiFetch(
    endpoint: string,
    options: RequestInit = {}
): Promise<Response> {
    const tokens = getTokens();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };

    if (tokens?.access) {
        headers['Authorization'] = `Bearer ${tokens.access}`;
    }

    const res = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
    });

    // Auto-refresh on 401
    if (res.status === 401 && tokens?.refresh) {
        try {
            const refreshRes = await fetch(`${API_BASE}/auth/token/refresh/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh: tokens.refresh }),
            });
            if (refreshRes.ok) {
                const data = await refreshRes.json();
                setTokens({ access: data.access, refresh: tokens.refresh });
                headers['Authorization'] = `Bearer ${data.access}`;
                return fetch(`${API_BASE}${endpoint}`, { ...options, headers });
            }
        } catch {
            clearTokens();
        }
    }

    return res;
}

// ─── Auth API ────────────────────────────────────────────────

export async function login(username: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });
    if (!res.ok) throw new Error('Invalid credentials');
    const data = await res.json();
    setTokens({ access: data.access, refresh: data.refresh });
    return data;
}

export async function register(userData: {
    username: string;
    email: string;
    password: string;
    password_confirm: string;
    first_name: string;
    last_name: string;
    role: string;
    department?: string;
}) {
    const res = await fetch(`${API_BASE}/auth/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(JSON.stringify(err));
    }
    return res.json();
}

export async function getProfile() {
    const res = await apiFetch('/auth/profile/');
    if (!res.ok) throw new Error('Failed to fetch profile');
    return res.json();
}

export function logout() {
    clearTokens();
}

// ─── Chat API ────────────────────────────────────────────────

export async function sendMessage(message: string) {
    const res = await apiFetch('/chat/', {
        method: 'POST',
        body: JSON.stringify({ message }),
    });
    if (!res.ok) throw new Error('Failed to send message');
    return res.json();
}

export async function getChatHistory() {
    const res = await apiFetch('/chat/history/');
    if (!res.ok) throw new Error('Failed to fetch history');
    return res.json();
}

// ─── Courses API ─────────────────────────────────────────────

export async function getCourses() {
    const res = await apiFetch('/courses/');
    if (!res.ok) throw new Error('Failed to fetch courses');
    return res.json();
}

export async function getCourse(id: number) {
    const res = await apiFetch(`/courses/${id}/`);
    if (!res.ok) throw new Error('Failed to fetch course');
    return res.json();
}

export async function getEnrollments() {
    const res = await apiFetch('/courses/enrollments/');
    if (!res.ok) throw new Error('Failed to fetch enrollments');
    return res.json();
}

export async function updateSyllabus(courseId: number, syllabus: string) {
    const res = await apiFetch('/courses/faculty/update-syllabus/', {
        method: 'POST',
        body: JSON.stringify({ course_id: courseId, syllabus }),
    });
    if (!res.ok) throw new Error('Failed to update syllabus');
    return res.json();
}

export async function getAssignments() {
    const res = await apiFetch('/courses/faculty/assignments/');
    if (!res.ok) throw new Error('Failed to fetch assignments');
    return res.json();
}

export async function createAssignment(data: {
    course: number;
    title: string;
    content: string;
    due_date?: string;
}) {
    const res = await apiFetch('/courses/faculty/assignments/', {
        method: 'POST',
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create assignment');
    return res.json();
}

// ─── Feedback API ────────────────────────────────────────────

export async function submitFeedback(comment: string, rating: number) {
    const res = await apiFetch('/courses/feedback/', {
        method: 'POST',
        body: JSON.stringify({ comment, rating }),
    });
    if (!res.ok) throw new Error('Failed to submit feedback');
    return res.json();
}
