'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(username, password);
            router.push('/dashboard');
        } catch {
            setError('Invalid username or password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24, background: 'var(--bg-page)', position: 'relative', overflow: 'hidden',
        }}>
            {/* BG gradients */}
            <div style={{
                position: 'absolute', top: '-15%', left: '-8%',
                width: 450, height: 450, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 70%)',
                filter: 'blur(70px)', pointerEvents: 'none',
            }} />
            <div style={{
                position: 'absolute', bottom: '-15%', right: '-8%',
                width: 400, height: 400, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)',
                filter: 'blur(70px)', pointerEvents: 'none',
            }} />

            <div className="card animate-fade-in-up" style={{
                width: '100%', maxWidth: 420, padding: '44px 36px', border: '1px solid var(--border)',
            }}>
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <img src="/logo.svg" alt="Logo" style={{ width: 80, height: 80, margin: '0 auto 14px', objectFit: 'contain' }} />
                    <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Welcome back</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: 6, fontSize: '0.9rem' }}>
                        Sign in to your UNIBOT account
                    </p>
                </div>

                {error && (
                    <div style={{
                        padding: '10px 14px', borderRadius: 'var(--radius-md)',
                        background: 'var(--red-light)', border: '1px solid rgba(239,68,68,0.2)',
                        color: 'var(--red)', fontSize: '0.85rem', marginBottom: 18, textAlign: 'center',
                    }}>{error}</div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: 16 }}>
                        <label className="input-label">Username</label>
                        <input type="text" className="input-field" placeholder="Enter username"
                            value={username} onChange={(e) => setUsername(e.target.value)}
                            required id="login-username" />
                    </div>
                    <div style={{ marginBottom: 24 }}>
                        <label className="input-label">Password</label>
                        <input type="password" className="input-field" placeholder="Enter password"
                            value={password} onChange={(e) => setPassword(e.target.value)}
                            required id="login-password" />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading}
                        id="login-submit" style={{ width: '100%', padding: 14 }}>
                        {loading ? 'Signing in...' : '🚀 Sign In'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: 20, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                    Don&apos;t have an account? <Link href="/register" style={{ fontWeight: 600 }}>Create one</Link>
                </div>

                <div style={{
                    marginTop: 20, padding: 14, borderRadius: 'var(--radius-md)',
                    background: 'var(--primary-100)', border: '1px solid var(--primary-200)',
                    fontSize: '0.78rem', color: 'var(--text-secondary)',
                }}>
                    <div style={{ fontWeight: 700, marginBottom: 4, color: 'var(--text-primary)' }}>🔑 Demo Credentials</div>
                    <div>Student: <code style={{ background: 'white', padding: '1px 5px', borderRadius: 4, fontSize: '0.75rem' }}>student1</code> / <code style={{ background: 'white', padding: '1px 5px', borderRadius: 4, fontSize: '0.75rem' }}>student123</code></div>
                    <div>Faculty: <code style={{ background: 'white', padding: '1px 5px', borderRadius: 4, fontSize: '0.75rem' }}>prof_sharma</code> / <code style={{ background: 'white', padding: '1px 5px', borderRadius: 4, fontSize: '0.75rem' }}>faculty123</code></div>
                </div>
            </div>
        </div>
    );
}
