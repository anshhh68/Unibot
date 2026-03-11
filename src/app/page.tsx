'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  const enter = (role: 'student' | 'faculty') => {
    localStorage.setItem('unibot_role', role);
    router.push('/dashboard');
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #FFF7ED 0%, #FFFBEB 50%, #F0FDFA 100%)',
      padding: 24,
    }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <img src="/logo.svg" alt="UNIBOT" style={{ width: 80, height: 80, marginBottom: 18, objectFit: 'contain' }} />
        <h1 style={{
          fontFamily: "'Space Grotesk', sans-serif", fontSize: '2.8rem',
          fontWeight: 900, color: 'var(--primary)', marginBottom: 10, lineHeight: 1,
        }}>UNIBOT</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
          AI-Powered University Assistant
        </p>
      </div>

      <p style={{
        color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: 28,
        fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
      }}>
        Choose your role to continue
      </p>

      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
        <RoleCard
          emoji="🎓"
          title="Student"
          desc="View courses, chat with AI & check your schedule"
          accentColor="var(--primary)"
          glowColor="rgba(249,115,22,0.18)"
          onClick={() => enter('student')}
        />
        <RoleCard
          emoji="👨‍🏫"
          title="Professor"
          desc="Manage courses, review assignments & grades"
          accentColor="var(--blue)"
          glowColor="rgba(59,130,246,0.18)"
          onClick={() => enter('faculty')}
        />
      </div>
    </div>
  );
}

function RoleCard({
  emoji, title, desc, accentColor, glowColor, onClick,
}: {
  emoji: string; title: string; desc: string;
  accentColor: string; glowColor: string; onClick: () => void;
}) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'white',
        border: `2px solid ${hovered ? accentColor : 'var(--border)'}`,
        borderRadius: 20, padding: '36px 44px', cursor: 'pointer',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
        boxShadow: hovered ? `0 12px 36px ${glowColor}` : '0 4px 20px rgba(0,0,0,0.06)',
        transform: hovered ? 'translateY(-6px)' : 'none',
        transition: 'all 0.2s ease',
        minWidth: 210, textAlign: 'center',
      }}
    >
      <span style={{ fontSize: '3.2rem', lineHeight: 1 }}>{emoji}</span>
      <div>
        <div style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: 6 }}>
          {title}
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: 160, lineHeight: 1.5 }}>
          {desc}
        </div>
      </div>
      <span style={{
        background: accentColor, color: 'white',
        padding: '7px 22px', borderRadius: 9999,
        fontSize: '0.82rem', fontWeight: 700,
      }}>
        Enter →
      </span>
    </button>
  );
}
