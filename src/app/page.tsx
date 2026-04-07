'use client';

import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '';

export default function LandingPage() {
  const router = useRouter();
  const { user, signIn, signOut } = useAuth();
  const googleBtnRef = useRef<HTMLDivElement>(null);
  const heroBtnRef = useRef<HTMLDivElement>(null);

  /* ── Initialize GSI once the script is loaded ── */
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    const initGSI = () => {
      if (!window.google?.accounts?.id) return;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response) => {
          signIn(response.credential);
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      // Render GSI button in navbar
      if (googleBtnRef.current) {
        googleBtnRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'outline',
          size: 'medium',
          shape: 'pill',
          text: 'signin_with',
        });
      }

      // Render GSI button in hero
      if (heroBtnRef.current) {
        heroBtnRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(heroBtnRef.current, {
          theme: 'filled_blue',
          size: 'large',
          shape: 'pill',
          text: 'continue_with',
          width: 260,
        });
      }
    };

    // Script may already be loaded or may fire onload after this effect
    if (window.google?.accounts?.id) {
      initGSI();
    } else {
      // Poll briefly for the script to load (strategy=beforeInteractive should make this fast)
      const poll = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(poll);
          initGSI();
        }
      }, 100);
      return () => clearInterval(poll);
    }
  }, [signIn]);

  /* ── Re-render buttons when user logs out ── */
  useEffect(() => {
    if (!user && window.google?.accounts?.id && GOOGLE_CLIENT_ID) {
      if (googleBtnRef.current) {
        googleBtnRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'outline',
          size: 'medium',
          shape: 'pill',
          text: 'signin_with',
        });
      }
      if (heroBtnRef.current) {
        heroBtnRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(heroBtnRef.current, {
          theme: 'filled_blue',
          size: 'large',
          shape: 'pill',
          text: 'continue_with',
          width: 260,
        });
      }
    }
  }, [user]);

  /* ── After sign-in go to dashboard ── */
  const goToDashboard = () => {
    localStorage.setItem('unibot_role', 'student');
    router.push('/dashboard');
  };

  return (
    <div style={{ background: 'white', minHeight: '100vh' }}>

      {/* ── Navbar ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        padding: '14px 40px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-light)', zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Image src="/logo.svg" alt="Logo" width={34} height={34} style={{ borderRadius: 10, objectFit: 'contain' }} />
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>
            UNIBOT
          </span>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {user ? (
            /* ── Signed-in user pill in navbar ── */
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                className="btn btn-primary btn-sm"
                onClick={goToDashboard}
                style={{ gap: 6 }}
              >
                🚀 Go to Dashboard
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {user.picture && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={user.picture}
                    alt={user.name}
                    width={34}
                    height={34}
                    style={{ borderRadius: '50%', border: '2px solid var(--primary)' }}
                    referrerPolicy="no-referrer"
                  />
                )}
                <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {user.given_name}
                </span>
              </div>
              <button
                className="btn btn-ghost"
                onClick={signOut}
                style={{ fontSize: '0.82rem' }}
              >
                Sign Out
              </button>
            </div>
          ) : (
            /* ── GSI button in navbar (unsigned) ── */
            <div ref={googleBtnRef} id="navbar-google-btn" style={{ minWidth: 140, minHeight: 38 }} />
          )}
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{
        paddingTop: 120, paddingBottom: 80,
        textAlign: 'center', maxWidth: 720, margin: '0 auto', padding: '120px 24px 80px',
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '6px 16px', borderRadius: 9999,
          background: 'var(--primary-50)', border: '1px solid var(--primary-100)',
          marginBottom: 24, fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 600,
        }}>✨ AI-Powered University Assistant</div>

        <h1 style={{
          fontSize: 'clamp(2.2rem, 5vw, 3.6rem)', fontWeight: 900, lineHeight: 1.1,
          marginBottom: 20, color: 'var(--text-primary)',
        }}>
          Seamlessly Connects<br />
          Students <span style={{ color: 'var(--primary)' }}>Anytime, Anywhere</span>
        </h1>

        <p style={{
          fontSize: '1.05rem', color: 'var(--text-secondary)',
          maxWidth: 540, margin: '0 auto 36px', lineHeight: 1.7,
        }}>
          Your 24/7 AI companion for course details, schedules, and administrative procedures.
          Ask anything in natural language.
        </p>

        {/* Primary CTAs */}
        {user ? (
          /* Signed-in: show dashboard CTA */
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 28 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 24px', borderRadius: 9999,
              background: 'var(--primary-50)', border: '1px solid var(--primary-100)',
              marginBottom: 8,
            }}>
              {user.picture && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={user.picture}
                  alt={user.name}
                  width={40}
                  height={40}
                  style={{ borderRadius: '50%', border: '2px solid var(--primary)' }}
                  referrerPolicy="no-referrer"
                />
              )}
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.92rem' }}>
                  Signed in as {user.name}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{user.email}</div>
              </div>
            </div>
            <button className="btn btn-primary btn-lg" onClick={goToDashboard}>🚀 Go to Dashboard</button>
            <button className="btn btn-outline btn-lg" onClick={signOut}>Sign Out</button>
          </div>
        ) : (
          /* Signed-out: show GSI hero button */
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 28 }}>
            <div ref={heroBtnRef} id="hero-google-btn" style={{ minWidth: 260, minHeight: 48 }} />
            <a href="#features" className="btn btn-outline btn-lg">Learn More</a>
          </div>
        )}

        {/* Chat preview mockup */}
        <div style={{
          marginTop: 52, borderRadius: 16,
          boxShadow: '0 20px 60px rgba(0,0,0,0.1)', overflow: 'hidden',
          border: '1px solid var(--border-light)', maxWidth: 500, margin: '52px auto 0',
          background: 'white',
        }}>
          <div style={{
            background: 'var(--bg-page)', padding: '12px 18px',
            display: 'flex', alignItems: 'center', gap: 8,
            borderBottom: '1px solid var(--border-light)',
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }} />
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>UNIBOT Assistant — Online</span>
          </div>
          <div style={{ padding: '20px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{
                background: 'var(--primary)', color: 'white',
                padding: '10px 16px', borderRadius: '16px 16px 4px 16px',
                fontSize: '0.88rem', fontWeight: 500, maxWidth: '80%',
              }}>What are my upcoming deadlines?</div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <Image src="/logo.svg" alt="Bot" width={30} height={30} style={{ borderRadius: '50%', background: '#F1F5F9', objectFit: 'contain', flexShrink: 0 }} />
              <div style={{
                background: 'var(--bg-page)', padding: '12px 16px',
                borderRadius: '4px 16px 16px 16px',
                fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.6,
              }}>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>📋 You have 3 upcoming deadlines:</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {[
                    { name: 'Python Basics Lab', code: 'CS101', date: 'Feb 18' },
                    { name: 'Binary Tree Implementation', code: 'CS201', date: 'Feb 25' },
                    { name: 'Derivatives Worksheet', code: 'MATH101', date: 'Feb 21' },
                  ].map((d, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>📌</span>
                      <span><strong>{d.name}</strong> <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>({d.code})</span> — {d.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" style={{ padding: '80px 40px', background: 'var(--bg-page)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 12 }}>
              Everything You Need in <span style={{ color: 'var(--primary)' }}>One Place</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
              A digital bridge between students and their academic journey.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
            {[
              { icon: '🤖', color: 'var(--purple-50)', title: 'Natural Language Chat', desc: 'Ask questions in plain English. No complicated navigation or forms.' },
              { icon: '📚', color: 'var(--blue-50)', title: 'Course Information', desc: 'Instant access to syllabi, schedules, and course details.' },
              { icon: '🔔', color: 'var(--amber-50)', title: 'Assignment Tracking', desc: 'Never miss a deadline. Get reminders about upcoming assignments.' },
              { icon: '📊', color: '#F0FDF4', title: 'Faculty Updates', desc: 'Faculty updates content in real-time, students get info instantly.' },
              { icon: '🔑', color: 'var(--primary-50)', title: 'Role-Based Access', desc: 'Secure access for students, faculty, and admins.' },
              { icon: '⚡', color: 'var(--purple-50)', title: '24/7 Availability', desc: 'Available around the clock. Get help whenever you need it.' },
            ].map((f, i) => (
              <div key={i} style={{
                background: 'white', borderRadius: 16, padding: '28px 24px',
                boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-light)',
                transition: 'box-shadow 0.2s',
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12, background: f.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.4rem', marginBottom: 16,
                }}>{f.icon}</div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: '0.868rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section style={{ padding: '80px 40px', background: 'white' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 52 }}>
            How It <span style={{ color: 'var(--primary)' }}>Works</span>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
            {[
              { n: '01', title: 'Sign In with Google', desc: 'Use your Google account — no passwords, no sign-up form needed.' },
              { n: '02', title: 'Ask Anything', desc: 'Type your question in natural language.' },
              { n: '03', title: 'Get Answers', desc: 'Receive AI responses using real course data.' },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '2.5rem', fontWeight: 900, color: 'var(--primary)',
                  fontFamily: "'Space Grotesk', sans-serif", marginBottom: 14, lineHeight: 1,
                }}>{s.n}</div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 8 }}>{s.title}</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '80px 40px', background: 'var(--bg-page)', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 14 }}>Ready to Get Started?</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: '1rem' }}>
          Join thousands of students who are already using <span style={{ color: 'var(--primary)', fontWeight: 700 }}>UNIBOT</span>.
        </p>
        {user ? (
          <button className="btn btn-primary btn-lg" onClick={goToDashboard}>🚀 Launch UNIBOT</button>
        ) : (
          <div style={{ display: 'inline-block' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 16 }}>
              Sign in with your Google account to continue
            </p>
            <div id="cta-google-btn" style={{ display: 'flex', justifyContent: 'center' }} />
          </div>
        )}
      </section>

      {/* ── Footer ── */}
      <footer style={{
        padding: '28px 40px', textAlign: 'center',
        borderTop: '1px solid var(--border-light)', background: 'white',
      }}>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, color: 'var(--primary)', fontSize: '1rem', marginBottom: 6 }}>
          UNIBOT
        </div>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          © 2024 UNIBOT. Built with the Antigravity Boilerplate.
        </p>
      </footer>

    </div>
  );
}
