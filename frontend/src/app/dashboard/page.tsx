'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
    sendMessage, getChatHistory, getCourses, getEnrollments,
    updateSyllabus, getAssignments, createAssignment, submitFeedback,
} from '@/lib/api';

/* ── Types ──────────────────────────────────────────────────── */
interface ChatMsg {
    id: number; content: string;
    response?: { response_text: string; timestamp: string };
    timestamp: string;
}
interface CourseData {
    id: number; name: string; code: string; syllabus: string;
    description: string; department: string; faculty_name: string;
}
interface AssignmentData {
    id: number; title: string; content: string; course: number;
    course_name: string; due_date: string; created_at?: string;
}
interface EnrollmentData {
    id: number; course_detail: CourseData; enrollment_num: string;
}

const COURSE_COLORS = [
    { bg: '#EFF6FF', color: '#3B82F6', icon: '✏️' },
    { bg: '#F0FDFA', color: '#14B8A6', icon: '<>' },
    { bg: '#FFF7ED', color: '#F97316', icon: '🔑' },
    { bg: '#F5F3FF', color: '#8B5CF6', icon: '⚡' },
    { bg: '#FEF2F2', color: '#EF4444', icon: '🔬' },
    { bg: '#FFFBEB', color: '#F59E0B', icon: '📐' },
];

const AVATAR_BG = ['avatar-orange', 'avatar-blue', 'avatar-green', 'avatar-purple', 'avatar-dark', 'avatar-amber'];

function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
}
function formatDate() {
    return new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}
function formatDateOrdinal() {
    const d = new Date();
    const day = d.getDate();
    const suffix = [, 'st', 'nd', 'rd'][day % 10 > 3 ? 0 : (day % 100 - day % 10 !== 10 ? day % 10 : 0)] || 'th';
    return `${d.toLocaleDateString('en-US', { weekday: 'long' })}, ${d.toLocaleDateString('en-US', { month: 'long' })} ${day}${suffix}, ${d.getFullYear()}`;
}

/* ═══════════════════════════════════════════════════════════════
   MAIN DASHBOARD
   ═══════════════════════════════════════════════════════════════ */
export default function DashboardPage() {
    const { user, loading, logout } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('dashboard');

    useEffect(() => {
        if (!loading && !user) router.push('/login');
    }, [user, loading, router]);

    if (loading) return <LoadingScreen />;
    if (!user) return null;

    const isStudent = user.role === 'student';
    const displayName = user.first_name || user.username;
    const initials = `${(user.first_name?.[0] || '').toUpperCase()}${(user.last_name?.[0] || '').toUpperCase()}` || 'U';

    const studentTabs = [
        { id: 'dashboard', icon: '🏠', label: 'Dashboard' },
        { id: 'courses', icon: '📚', label: 'Courses' },
        { id: 'schedule', icon: '📅', label: 'Schedule' },
        { id: 'assignments', icon: '📝', label: 'Assignments' },
        { id: 'grades', icon: '✨', label: 'Grades' },
    ];
    const facultyTabs = [
        { id: 'dashboard', icon: '🏠', label: 'Dashboard' },
        { id: 'courses', icon: '📚', label: 'My Courses' },
        { id: 'research', icon: '📄', label: 'Research' },
        { id: 'schedule', icon: '📅', label: 'Schedule' },
        { id: 'grades', icon: '⭐', label: 'Grades' },
        { id: 'messages', icon: '💬', label: 'Messages' },
    ];
    const tabs = isStudent ? studentTabs : facultyTabs;

    return (
        <div className="dashboard">
            {/* ── SIDEBAR ────────────────────────────────── */}
            <aside className="sidebar">
                <div className="sidebar-brand">
                    <img src="/logo.svg" alt="Logo" style={{ width: 36, height: 36, objectFit: 'contain' }} />
                    <span className="sidebar-brand-text">UNIBOT</span>
                </div>

                <nav className="sidebar-nav">
                    {tabs.map((t) => (
                        <button key={t.id}
                            className={`sidebar-link ${activeTab === t.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(t.id)}>
                            <span className="sidebar-icon">{t.icon}</span>
                            <span>{t.label}</span>
                        </button>
                    ))}
                </nav>

                {/* Storage (Faculty) */}
                {!isStudent && (
                    <div className="sidebar-storage">
                        <div className="sidebar-storage-label">Storage Used</div>
                        <div className="sidebar-storage-bar">
                            <div className="sidebar-storage-fill" style={{ width: '76%' }} />
                        </div>
                        <div className="sidebar-storage-text">15.2 GB of 20 GB</div>
                    </div>
                )}

                <div className="sidebar-footer">
                    {isStudent && (
                        <button className="sidebar-link" onClick={() => setActiveTab('settings')}>
                            <span className="sidebar-icon">⚙️</span><span>Settings</span>
                        </button>
                    )}
                    <button className="sidebar-link" onClick={() => { logout(); router.push('/'); }}>
                        <span className="sidebar-icon">↩️</span><span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* ── MAIN CONTENT ──────────────────────────── */}
            <main className="main-content">
                <div className="topbar">
                    <div className="topbar-breadcrumb">
                        {isStudent ? 'Student' : 'Faculty'} Dashboard &nbsp;&gt;&nbsp; <span>Overview</span>
                    </div>
                    <div className="topbar-right">
                        {!isStudent && (
                            <div style={{ position: 'relative' }}>
                                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: '0.82rem', color: 'var(--text-muted)' }}>🔍</span>
                                <input type="text" className="topbar-search" placeholder="Search for students, files..." />
                            </div>
                        )}
                        <div className="topbar-bell">
                            🔔
                            <div className="topbar-bell-dot" />
                        </div>
                        <div className="topbar-user">
                            <div className="topbar-user-info">
                                <div className="topbar-user-name">{user.first_name} {user.last_name}</div>
                                <div className="topbar-user-role">
                                    {isStudent ? `ID: ${user.username}` : user.department || 'Department Head'}
                                </div>
                            </div>
                            <div className="avatar avatar-green">{initials}</div>
                        </div>
                    </div>
                </div>

                <div className="page-content">
                    {activeTab === 'dashboard' && (
                        isStudent
                            ? <StudentDashboard user={user} displayName={displayName} />
                            : <FacultyDashboard user={user} displayName={displayName} />
                    )}
                    {activeTab === 'courses' && <CoursesFullPanel user={user} />}
                    {activeTab === 'schedule' && <SchedulePanel />}
                    {activeTab === 'assignments' && isStudent && <PlaceholderPanel icon="📝" title="Assignments" text="Your assignments will appear here." />}
                    {activeTab === 'grades' && <PlaceholderPanel icon="📊" title="Grades" text="Your grades will appear here." />}
                    {activeTab === 'research' && <PlaceholderPanel icon="📄" title="Research" text="Research tools coming soon." />}
                    {activeTab === 'messages' && <PlaceholderPanel icon="💬" title="Messages" text="Messaging coming soon." />}
                    {activeTab === 'settings' && <PlaceholderPanel icon="⚙️" title="Settings" text="Settings coming soon." />}
                </div>
            </main>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   LOADING
   ═══════════════════════════════════════════════════════════════ */
function LoadingScreen() {
    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center',
            justifyContent: 'center', flexDirection: 'column', gap: 14,
            background: 'var(--bg-page)',
        }}>
            <img src="/logo.svg" alt="Logo" style={{ width: 64, height: 64, animation: 'pulse 1.5s infinite', objectFit: 'contain' }} />
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading UNIBOT...</p>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   STUDENT DASHBOARD
   ═══════════════════════════════════════════════════════════════ */
function StudentDashboard({ user, displayName }: { user: { first_name: string; username: string }; displayName: string }) {
    const [enrollments, setEnrollments] = useState<EnrollmentData[]>([]);
    useEffect(() => {
        getEnrollments().then((d) => setEnrollments(Array.isArray(d) ? d : d.results || [])).catch(console.error);
    }, []);

    const nextClass = enrollments[0]?.course_detail?.name || 'Data Structures';

    return (
        <div className="animate-fade-in">
            {/* Greeting */}
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: '1.7rem', fontWeight: 800 }}>
                    {getGreeting()}, {displayName} 👋
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: 4 }}>
                    It&apos;s {formatDateOrdinal()}. You have {enrollments.length || 3} tasks for today.
                </p>
            </div>

            {/* Stats */}
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                <div className="card stat-card">
                    <div className="stat-icon stat-icon-blue">📕</div>
                    <div>
                        <div className="stat-label">NEXT CLASS</div>
                        <div className="stat-value" style={{ fontSize: '1.1rem' }}>{nextClass.split(' ').slice(0, 2).join(' ')}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6 }}>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>⏱ 10:30 AM</span>
                            <span className="badge badge-blue" style={{ fontWeight: 600 }}>Room 402</span>
                        </div>
                    </div>
                </div>
                <div className="card stat-card">
                    <div className="stat-icon stat-icon-orange">📋</div>
                    <div>
                        <div className="stat-label">DEADLINES</div>
                        <div className="stat-value" style={{ fontSize: '1.1rem' }}>2 Due Today</div>
                        <div style={{ marginTop: 6, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            Math Quiz, Lab Report &nbsp;
                            <a href="#" style={{ fontWeight: 700, fontSize: '0.78rem' }}>View All</a>
                        </div>
                    </div>
                </div>
                <div className="card stat-card">
                    <div className="stat-icon stat-icon-green">✅</div>
                    <div>
                        <div className="stat-label">PENDING TASKS</div>
                        <div className="stat-value" style={{ fontSize: '1.1rem' }}>8 Activities</div>
                        <div style={{
                            marginTop: 8, width: 120, height: 5, background: 'var(--border)',
                            borderRadius: 3, overflow: 'hidden',
                        }}>
                            <div style={{
                                width: '65%', height: '100%', borderRadius: 3,
                                background: 'linear-gradient(90deg, var(--primary), var(--green))',
                            }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat + Calendar */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>
                <div className="card"><ChatWidget user={user} /></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className="card"><CalendarWidget /></div>
                    <div className="card" style={{ padding: 20 }}>
                        <div className="schedule-label">TODAY&apos;S SCHEDULE</div>
                        <div className="schedule-item">
                            <div className="schedule-dot" style={{ background: 'var(--primary)' }} />
                            <div>
                                <div className="schedule-time" style={{ color: 'var(--primary)' }}>10:30 AM</div>
                                <div className="schedule-title">Data Structures Lecture</div>
                                <div className="schedule-location">Hall B-12</div>
                            </div>
                        </div>
                        <div className="schedule-item">
                            <div className="schedule-dot" style={{ background: 'var(--green)' }} />
                            <div>
                                <div className="schedule-time" style={{ color: 'var(--green)' }}>1:45 PM</div>
                                <div className="schedule-title">UI/UX Seminar</div>
                                <div className="schedule-location">Innovation Lab</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   FACULTY DASHBOARD
   ═══════════════════════════════════════════════════════════════ */
function FacultyDashboard({ user, displayName }: { user: { first_name: string; last_name: string; username: string }; displayName: string }) {
    const [courses, setCourses] = useState<CourseData[]>([]);
    const [assignments, setAssignments] = useState<AssignmentData[]>([]);
    const [syllabusEdit, setSyllabusEdit] = useState<{ courseId: number; text: string } | null>(null);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState('');

    useEffect(() => {
        getCourses().then((d) => setCourses(Array.isArray(d) ? d : d.results || [])).catch(console.error);
        getAssignments().then((d) => setAssignments(Array.isArray(d) ? d : d.results || [])).catch(console.error);
    }, []);

    const handleSave = async () => {
        if (!syllabusEdit) return;
        setSaving(true);
        try {
            await updateSyllabus(syllabusEdit.courseId, syllabusEdit.text);
            setToast('Syllabus updated!');
            setSyllabusEdit(null);
            getCourses().then((d) => setCourses(Array.isArray(d) ? d : d.results || []));
        } catch { setToast('Failed to update.'); }
        finally { setSaving(false); setTimeout(() => setToast(''), 3000); }
    };

    const enrollCounts = [12, 45, 8, 22, 15, 30];
    const reviewData = [
        { name: 'Alice Johnson', assignment: 'ASSIGNMENT 01: LOW FIDELITY', time: '2 hours ago', attempt: 'Attempt #1', status: 'needs_review' },
        { name: 'David Chen', assignment: 'FINAL PROJECT PROPOSAL', time: '5 hours ago', attempt: 'Attempt #2', status: 'needs_review' },
        { name: 'Marcus Wright', assignment: 'NEURAL NETWORKS ESSAY', time: 'Yesterday', attempt: '94/100', status: 'graded' },
    ];

    return (
        <div className="animate-fade-in">
            {/* Greeting */}
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: '1.7rem', fontWeight: 800 }}>
                    Welcome back, Prof. {user.last_name || displayName}
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: 4 }}>
                    Today is {formatDate()}
                </p>
            </div>

            {/* Stats */}
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                {[
                    { icon: '👥', label: 'Total Students', val: '1,284', iconBg: 'stat-icon-blue', valColor: '' },
                    { icon: '📝', label: 'Pending Grades', val: '24', iconBg: 'stat-icon-orange', valColor: 'stat-value-orange' },
                    { icon: '📊', label: 'Average Score', val: '88.4%', iconBg: 'stat-icon-green', valColor: 'stat-value-green' },
                    { icon: '✉️', label: 'Unread Messages', val: '7', iconBg: 'stat-icon-purple', valColor: 'stat-value-purple' },
                ].map((s, i) => (
                    <div key={i} className="card stat-card">
                        <div className={`stat-icon ${s.iconBg}`}>{s.icon}</div>
                        <div>
                            <div className="stat-label">{s.label}</div>
                            <div className={`stat-value ${s.valColor}`}>{s.val}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Manage Courses */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <h2 style={{ fontSize: '1.25rem' }}>Manage Courses</h2>
                <button className="btn btn-outline btn-sm" style={{ gap: 6 }}>
                    <span style={{ fontSize: '1rem', color: 'var(--primary)' }}>⊕</span> New Course
                </button>
            </div>

            <div className="course-grid" style={{ marginBottom: 32 }}>
                {courses.map((c, i) => {
                    const clr = COURSE_COLORS[i % COURSE_COLORS.length];
                    const cnt = enrollCounts[i % enrollCounts.length];
                    return (
                        <div key={c.id} className="card course-card">
                            <span className="course-badge">{c.code}</span>
                            <div className="course-icon" style={{ background: clr.bg, color: clr.color, fontSize: clr.icon.length > 2 ? '0.85rem' : '1.2rem', fontWeight: 700 }}>
                                {clr.icon}
                            </div>
                            <h3>{c.name}</h3>
                            <p className="course-desc">{c.description || 'In-depth exploration of core concepts and modern applications.'}</p>
                            <div className="course-footer">
                                <div className="course-avatars">
                                    {[0, 1, 2].map((j) => (
                                        <div key={j} className={`avatar ${AVATAR_BG[(i * 3 + j) % AVATAR_BG.length]}`}
                                            style={{ width: 28, height: 28, fontSize: '0.55rem', marginLeft: j > 0 ? -6 : 0, border: '2px solid white' }}>
                                            {String.fromCharCode(65 + j)}
                                        </div>
                                    ))}
                                    <div className="course-avatars">
                                        <span className="count" style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--bg-input)', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-secondary)', marginLeft: -6 }}>
                                            +{cnt}
                                        </span>
                                    </div>
                                </div>
                                <span className="enrolled-text">Enrolled Students</span>
                            </div>
                            <button className="course-edit-btn" onClick={() => setSyllabusEdit({ courseId: c.id, text: c.syllabus || '' })}>
                                ✏️ Edit Syllabus
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Assignment Review */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h2 style={{ fontSize: '1.25rem' }}>Assignment Review</h2>
                <div className="review-tabs">
                    <button className="review-tab">All</button>
                    <button className="review-tab active">Pending ({assignments.length || 24})</button>
                    <button className="review-tab">Graded</button>
                </div>
            </div>

            <div className="card" style={{ overflow: 'hidden' }}>
                {reviewData.map((r, i) => (
                    <div key={i} className="review-item">
                        <div className={`avatar avatar-lg ${AVATAR_BG[i % AVATAR_BG.length]}`}>
                            {r.name.split(' ').map(w => w[0]).join('')}
                        </div>
                        <div className="review-info">
                            <div className="review-name">{r.name}</div>
                            <div className="review-meta">
                                <span className="review-assignment-badge">{r.assignment}</span>
                                <span>•</span>
                                <span>⏱ {r.time}</span>
                            </div>
                        </div>
                        <div className="review-right">
                            <div className="review-status-col">
                                <div className={`review-status-badge ${r.status === 'graded' ? 'badge-green' : 'badge-amber'}`}>
                                    {r.status === 'graded' ? 'GRADED' : 'NEEDS REVIEW'}
                                </div>
                                <div className="review-attempt">{r.attempt}</div>
                            </div>
                            {r.status === 'needs_review' ? (
                                <button className="review-btn review-btn-dark">Review Submission</button>
                            ) : (
                                <button className="review-btn review-btn-outline">View Grade</button>
                            )}
                        </div>
                    </div>
                ))}
                <div style={{ padding: '14px 22px', textAlign: 'center', borderTop: '1px solid var(--border-light)' }}>
                    <a href="#" style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>View all submissions ↓</a>
                </div>
            </div>

            {/* Syllabus Modal */}
            {syllabusEdit && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
                }} onClick={() => setSyllabusEdit(null)}>
                    <div className="card" style={{ padding: 32, width: '100%', maxWidth: 580 }} onClick={(e) => e.stopPropagation()}>
                        <h2 style={{ fontSize: '1.15rem', marginBottom: 16 }}>✏️ Edit Syllabus</h2>
                        <textarea className="input-field" rows={10} value={syllabusEdit.text}
                            onChange={(e) => setSyllabusEdit({ ...syllabusEdit, text: e.target.value })}
                            style={{ marginBottom: 16, minHeight: 200 }} />
                        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                            <button className="btn btn-white" onClick={() => setSyllabusEdit(null)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                                {saving ? 'Saving...' : '💾 Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {toast && (
                <div style={{
                    position: 'fixed', bottom: 24, right: 24, padding: '12px 20px',
                    borderRadius: 'var(--radius-md)',
                    background: toast.includes('updated') ? 'var(--green)' : 'var(--red)',
                    color: 'white', fontWeight: 600, fontSize: '0.85rem',
                    boxShadow: 'var(--shadow-lg)', zIndex: 200,
                    animation: 'fadeInUp 0.3s ease-out',
                }}>{toast}</div>
            )}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   CHAT WIDGET
   ═══════════════════════════════════════════════════════════════ */
function ChatWidget({ user }: { user: { first_name: string; username: string } }) {
    const [messages, setMessages] = useState<ChatMsg[]>([]);
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);
    const endRef = useRef<HTMLDivElement>(null);
    const scroll = useCallback(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, []);

    useEffect(() => {
        getChatHistory().then((d) => setMessages(Array.isArray(d) ? d : d.results || [])).catch(console.error);
    }, []);
    useEffect(() => { scroll(); }, [messages, scroll]);

    const handleSend = async () => {
        if (!input.trim() || sending) return;
        const text = input.trim(); setInput(''); setSending(true);
        const tmp: ChatMsg = { id: Date.now(), content: text, timestamp: new Date().toISOString() };
        setMessages((p) => [...p, tmp]);
        try {
            const res = await sendMessage(text);
            setMessages((p) => p.map((m) => m.id === tmp.id
                ? { ...m, id: res.query_id, response: { response_text: res.response, timestamp: res.timestamp } } : m));
        } catch {
            setMessages((p) => p.map((m) => m.id === tmp.id
                ? { ...m, response: { response_text: '⚠️ Something went wrong. Try again.', timestamp: '' } } : m));
        } finally { setSending(false); }
    };

    const name = user.first_name || user.username;
    const initials = (user.first_name?.[0] || 'U').toUpperCase();
    const suggestions = ['Set Reminder', 'Check Grades', 'Library Hours', 'Campus Map'];

    return (
        <div className="chat-widget">
            <div className="chat-header">
                <div className="chat-header-title">
                    <span className="chat-online-dot" />
                    UNIBOT Assistant
                </div>
                <span className="chat-menu">•••</span>
            </div>

            <div className="chat-messages">
                {/* Default bot message */}
                {messages.length === 0 && !sending && (
                    <div className="msg-row-bot">
                        <img src="/logo.svg" alt="Bot" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'contain', background: '#F1F5F9' }} />
                        <div className="msg-bot-bubble">
                            Hello {name}! How can I help you today? I can help you check your grades, find study materials, or show your upcoming exam schedule.
                        </div>
                    </div>
                )}

                {messages.map((m) => (
                    <React.Fragment key={m.id}>
                        <div className="msg-row-user">
                            <div className="msg-user-avatar">{initials}</div>
                            <div className="msg-user-bubble">{m.content}</div>
                        </div>
                        {m.response ? (
                            <div className="msg-row-bot">
                                <img src="/logo.svg" alt="Bot" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'contain', background: '#F1F5F9' }} />
                                <div className="msg-bot-bubble" style={{ whiteSpace: 'pre-wrap' }}>
                                    {m.response.response_text}
                                </div>
                            </div>
                        ) : sending && (
                            <div className="msg-row-bot">
                                <img src="/logo.svg" alt="Bot" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'contain', background: '#F1F5F9' }} />
                                <div className="msg-bot-bubble typing-dots"><span /><span /><span /></div>
                            </div>
                        )}
                    </React.Fragment>
                ))}
                <div ref={endRef} />
            </div>

            <div className="chat-chips">
                {suggestions.map((s) => (
                    <button key={s} className="chip" onClick={() => setInput(s)}>{s}</button>
                ))}
            </div>

            <div className="chat-input-bar">
                <input type="text" placeholder="Ask UNIBOT anything..."
                    value={input} onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    disabled={sending} />
                <button className="chat-send" onClick={handleSend} disabled={sending || !input.trim()}>
                    ➤
                </button>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   CALENDAR
   ═══════════════════════════════════════════════════════════════ */
function CalendarWidget() {
    const [month, setMonth] = useState(new Date().getMonth());
    const [year, setYear] = useState(new Date().getFullYear());
    const today = new Date();
    const first = new Date(year, month, 1).getDay();
    const days = new Date(year, month + 1, 0).getDate();
    const prevDays = new Date(year, month, 0).getDate();
    const name = new Date(year, month).toLocaleString('en-US', { month: 'long', year: 'numeric' });

    const cells: { day: number; current: boolean }[] = [];
    for (let i = first - 1; i >= 0; i--) cells.push({ day: prevDays - i, current: false });
    for (let i = 1; i <= days; i++) cells.push({ day: i, current: true });
    const rem = 42 - cells.length;
    for (let i = 1; i <= rem; i++) cells.push({ day: i, current: false });

    const isToday = (d: number, c: boolean) =>
        c && d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

    const prev = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
    const next = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

    return (
        <div className="calendar">
            <div className="calendar-header">
                <h3>{name}</h3>
                <div className="calendar-nav">
                    <button onClick={prev}>‹</button>
                    <button onClick={next}>›</button>
                </div>
            </div>
            <div className="calendar-grid">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <div key={i} className="cal-day-name">{d}</div>)}
                {cells.map((c, i) => (
                    <div key={i} className={`cal-day ${!c.current ? 'other-month' : ''} ${isToday(c.day, c.current) ? 'today' : ''}`}>
                        {c.day}
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   COURSES PAGE
   ═══════════════════════════════════════════════════════════════ */
function CoursesFullPanel({ user }: { user: { role: string } }) {
    const [courses, setCourses] = useState<CourseData[]>([]);
    const [enrollments, setEnrollments] = useState<EnrollmentData[]>([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const load = async () => {
            try {
                if (user.role === 'student') {
                    const d = await getEnrollments();
                    setEnrollments(Array.isArray(d) ? d : d.results || []);
                } else {
                    const d = await getCourses();
                    setCourses(Array.isArray(d) ? d : d.results || []);
                }
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        }; load();
    }, [user.role]);

    const list = user.role === 'student' ? enrollments.map(e => e.course_detail) : courses;
    if (loading) return <p style={{ color: 'var(--text-muted)' }}>Loading...</p>;

    return (
        <div className="animate-fade-in">
            <h1 style={{ fontSize: '1.4rem', marginBottom: 20 }}>
                {user.role === 'student' ? '📚 My Courses' : '📚 Courses I Teach'}
            </h1>
            <div className="course-grid">
                {list.map((c, i) => {
                    const clr = COURSE_COLORS[i % COURSE_COLORS.length];
                    return (
                        <div key={c.id} className="card course-card">
                            <span className="course-badge">{c.code}</span>
                            <div className="course-icon" style={{ background: clr.bg, color: clr.color }}>{clr.icon.length > 2 ? clr.icon : clr.icon}</div>
                            <h3>{c.name}</h3>
                            <p className="course-desc">{c.description || 'No description available.'}</p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 'auto', paddingTop: 12, borderTop: '1px solid var(--border-light)' }}>
                                <span>🏫 {c.department || 'CS'}</span>
                                <span>👨‍🏫 {c.faculty_name || 'TBA'}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
            {list.length === 0 && (
                <div className="card" style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📭</div>
                    <p>No courses found.</p>
                </div>
            )}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   SCHEDULE PAGE
   ═══════════════════════════════════════════════════════════════ */
function SchedulePanel() {
    return (
        <div className="animate-fade-in">
            <h1 style={{ fontSize: '1.4rem', marginBottom: 20 }}>📅 Schedule</h1>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div className="card"><CalendarWidget /></div>
                <div className="card" style={{ padding: 24 }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: 16 }}>Upcoming Events</h3>
                    {[
                        { time: '10:30 AM', title: 'Data Structures', loc: 'Hall B-12', color: 'var(--primary)' },
                        { time: '1:45 PM', title: 'UI/UX Seminar', loc: 'Innovation Lab', color: 'var(--green)' },
                        { time: '3:00 PM', title: 'Lab Session', loc: 'Lab 3A', color: 'var(--blue)' },
                    ].map((ev, i) => (
                        <div key={i} className="schedule-item">
                            <div className="schedule-dot" style={{ background: ev.color }} />
                            <div>
                                <div className="schedule-time" style={{ color: ev.color }}>{ev.time}</div>
                                <div className="schedule-title">{ev.title}</div>
                                <div className="schedule-location">{ev.loc}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   PLACEHOLDER
   ═══════════════════════════════════════════════════════════════ */
function PlaceholderPanel({ icon, title, text }: { icon: string; title: string; text: string }) {
    return (
        <div className="animate-fade-in">
            <h1 style={{ fontSize: '1.4rem', marginBottom: 20 }}>{icon} {title}</h1>
            <div className="card" style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>{icon}</div>
                <p>{text}</p>
            </div>
        </div>
    );
}
