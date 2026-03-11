'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function LandingPage() {
  const { user, login } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [demoLoading, setDemoLoading] = useState<'student' | 'professor' | null>(null);
  const [demoError, setDemoError] = useState('');
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  const handleDemoLogin = async (role: 'student' | 'professor') => {
    setDemoError('');
    setDemoLoading(role);
    try {
      const creds = role === 'student'
        ? { username: 'student1', password: 'student123' }
        : { username: 'prof_sharma', password: 'faculty123' };
      await login(creds.username, creds.password);
      router.push('/dashboard');
    } catch {
      setDemoError('Demo login failed. Please try again.');
    } finally {
      setDemoLoading(null);
    }
  };

  return (
    <div style={{ background: 'white', minHeight: '100vh' }}>
      {/* ── Navbar ──────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, padding: '14px 40px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-light)', zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/logo.svg" alt="Logo" style={{ width: 34, height: 34, borderRadius: 10, objectFit: 'contain' }} />
          <span style={{
            fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.25rem',
            fontWeight: 800, color: 'var(--primary)',
          }}>UNIBOT</span>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {user ? (
            <Link href="/dashboard" className="btn btn-primary btn-sm">Dashboard →</Link>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost">Sign In</Link>
              <Link href="/register" className="btn btn-primary btn-sm">Get Started</Link>
            </>
          )}
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────── */}
      <section style={{
        paddingTop: 150, paddingBottom: 80, textAlign: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '5%', left: '5%', width: 400, height: 400,
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(249,115,22,0.06) 0%, transparent 70%)',
          filter: 'blur(60px)', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', right: '5%', width: 350, height: 350,
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)',
          filter: 'blur(60px)', pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: 780, margin: '0 auto', padding: '0 24px', position: 'relative' }}>
          <div className="animate-fade-in-up" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 18px',
            borderRadius: 9999, background: 'var(--primary-50)', border: '1px solid var(--primary-100)',
            marginBottom: 24, fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 600,
          }}>✨ AI-Powered University Assistant</div>

          <h1 className="animate-fade-in-up" style={{
            fontSize: 'clamp(2.2rem, 5vw, 3.6rem)', fontWeight: 900, lineHeight: 1.1,
            marginBottom: 20, color: 'var(--text-primary)', animationDelay: '0.1s',
          }}>
            Seamlessly Connects<br />Students{' '}
            <span style={{ color: 'var(--primary)' }}>Anytime, Anywhere</span>
          </h1>

          <p className="animate-fade-in-up" style={{
            fontSize: '1.05rem', color: 'var(--text-secondary)', maxWidth: 540,
            margin: '0 auto 36px', lineHeight: 1.7, animationDelay: '0.2s',
          }}>
            Your 24/7 AI companion for course details, schedules, and administrative procedures. Ask anything in natural language.
          </p>

          <div className="animate-fade-in-up" style={{
            display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', animationDelay: '0.3s',
          }}>
            <Link href={user ? '/dashboard' : '/register'} className="btn btn-primary btn-lg">🚀 Start Chatting</Link>
            <a href="#features" className="btn btn-outline btn-lg">Learn More</a>
          </div>

          {/* Demo Quick-Access */}
          {!user && (
            <div className="animate-fade-in-up" style={{ animationDelay: '0.4s', marginTop: 28 }}>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 10, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                🔑 Try a demo account
              </p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  onClick={() => handleDemoLogin('student')}
                  disabled={demoLoading !== null}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '9px 20px',
                    borderRadius: 9999, border: '1.5px solid var(--border)',
                    background: 'white', cursor: demoLoading ? 'wait' : 'pointer',
                    fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-primary)',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', transition: 'all 0.15s',
                    opacity: demoLoading === 'professor' ? 0.5 : 1,
                  }}
                >
                  <span style={{ fontSize: '1rem' }}>🎓</span>
                  {demoLoading === 'student' ? 'Signing in...' : 'Student Demo'}
                </button>
                <button
                  onClick={() => handleDemoLogin('professor')}
                  disabled={demoLoading !== null}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '9px 20px',
                    borderRadius: 9999, border: '1.5px solid var(--border)',
                    background: 'white', cursor: demoLoading ? 'wait' : 'pointer',
                    fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-primary)',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', transition: 'all 0.15s',
                    opacity: demoLoading === 'student' ? 0.5 : 1,
                  }}
                >
                  <span style={{ fontSize: '1rem' }}>👨‍🏫</span>
                  {demoLoading === 'professor' ? 'Signing in...' : 'Professor Demo'}
                </button>
              </div>
              {demoError && (
                <p style={{ marginTop: 10, fontSize: '0.82rem', color: 'var(--red)' }}>{demoError}</p>
              )}
            </div>
          )}
        </div>

        {/* Chat Preview */}
        <div className="animate-fade-in-up" style={{
          maxWidth: 560, margin: '50px auto 0', padding: '0 24px', animationDelay: '0.4s',
        }}>
          <div className="card" style={{ padding: 24, textAlign: 'left', border: '1px solid var(--border)' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18,
              paddingBottom: 14, borderBottom: '1px solid var(--border-light)',
            }}>
              <span style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }} />
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>UNIBOT Assistant — Online</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="msg-row-user" style={{ alignSelf: 'flex-end', maxWidth: '80%' }}>
                <div className="msg-user-bubble">What are my upcoming deadlines?</div>
              </div>
              <div className="msg-row-bot" style={{ maxWidth: '90%' }}>
                <img src="/logo.svg" alt="Bot" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'contain', background: '#F1F5F9' }} />
                <div className="msg-bot-bubble">
                  📋 You have 3 upcoming deadlines:<br /><br />
                  📝 <strong>Python Basics Lab</strong> (CS101) — Feb 18<br />
                  📝 <strong>Binary Tree Implementation</strong> (CS201) — Feb 25<br />
                  📝 <strong>Derivatives Worksheet</strong> (MATH101) — Feb 21
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────── */}
      <section id="features" style={{ padding: '70px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 50 }}>
          <h2 style={{ fontSize: '2rem', marginBottom: 12 }}>Everything You Need in <span style={{ color: 'var(--primary)' }}>One Place</span></h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: 480, margin: '0 auto' }}>
            A digital bridge between students and their academic journey.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: 20 }}>
          {[
            { icon: '💬', title: 'Natural Language Chat', desc: 'Ask questions in plain English. No complicated navigation or forms.', bg: '#FFF7ED', color: '#F97316' },
            { icon: '📚', title: 'Course Information', desc: 'Instant access to syllabi, schedules, and course details.', bg: '#EFF6FF', color: '#3B82F6' },
            { icon: '🔔', title: 'Assignment Tracking', desc: 'Never miss a deadline. Get reminders about upcoming assignments.', bg: '#FFFBEB', color: '#F59E0B' },
            { icon: '👨‍🏫', title: 'Faculty Updates', desc: 'Faculty updates content in real-time, students get info instantly.', bg: '#F0FDF4', color: '#22C55E' },
            { icon: '🔒', title: 'Role-Based Access', desc: 'Secure access for students, faculty, and admins.', bg: '#FEF2F2', color: '#EF4444' },
            { icon: '⚡', title: '24/7 Availability', desc: 'Available around the clock. Get help whenever you need it.', bg: '#F5F3FF', color: '#8B5CF6' },
          ].map((f, i) => (
            <div key={i} className="card" style={{ padding: 28, border: '1px solid var(--border-light)' }}>
              <div style={{
                width: 50, height: 50, borderRadius: 'var(--radius-md)', background: f.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.4rem', marginBottom: 18,
              }}>{f.icon}</div>
              <h3 style={{ fontSize: '1.05rem', marginBottom: 8 }}>{f.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ────────────────────────────── */}
      <section style={{ padding: '70px 24px', background: 'var(--bg-page)' }}>
        <div style={{ maxWidth: 850, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: 50 }}>How It <span style={{ color: 'var(--primary)' }}>Works</span></h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 36 }}>
            {[
              { step: '01', title: 'Sign Up', desc: 'Create your account and select your role.' },
              { step: '02', title: 'Ask Anything', desc: 'Type your question in natural language.' },
              { step: '03', title: 'Get Answers', desc: 'Receive AI responses using real course data.' },
            ].map((s, i) => (
              <div key={i}>
                <div style={{
                  fontSize: '2.5rem', fontWeight: 900, color: 'var(--primary)',
                  marginBottom: 12, fontFamily: "'Space Grotesk', sans-serif",
                }}>{s.step}</div>
                <h3 style={{ fontSize: '1.15rem', marginBottom: 6 }}>{s.title}</h3>
                <p style={{ color: 'var(--text-secondary)' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────── */}
      <section style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 540, margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: 16 }}>Ready to Get Started?</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: 28 }}>
            Join thousands of students who are already using UNIBOT.
          </p>
          <Link href={user ? '/dashboard' : '/register'} className="btn btn-primary btn-lg">🚀 Launch UNIBOT</Link>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────── */}
      <footer style={{
        padding: 36, borderTop: '1px solid var(--border-light)',
        textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem',
      }}>
        <span style={{
          fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.15rem',
          fontWeight: 800, color: 'var(--primary)',
        }}>UNIBOT</span>
        <p style={{ marginTop: 8 }}>© 2024 UNIBOT. Built with the Antigravity Boilerplate.</p>
      </footer>
    </div>
  );
}
