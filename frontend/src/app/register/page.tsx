'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { register } from '@/lib/api';
import { GoogleLogin } from '@react-oauth/google';

export default function RegisterPage() {
    const [form, setForm] = useState({
        username: '', email: '', password: '', password_confirm: '',
        first_name: '', last_name: '', role: 'student', department: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const auth = useAuth();
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (form.password !== form.password_confirm) { setError('Passwords do not match.'); return; }
        setLoading(true);
        try {
            await register(form);
            router.push('/login');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Registration failed');
        } finally { setLoading(false); }
    };

    const handleGoogleSuccess = async (credentialResponse: any) => {
        if (!credentialResponse.credential) return;
        setError('');
        setLoading(true);
        try {
            await auth.googleLogin(credentialResponse.credential);
            router.push('/dashboard');
        } catch {
            setError('Google Sign-In failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24, background: 'var(--bg-page)', position: 'relative', overflow: 'hidden',
        }}>
            <div style={{
                position: 'absolute', top: '-15%', right: '-8%',
                width: 450, height: 450, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 70%)',
                filter: 'blur(70px)', pointerEvents: 'none',
            }} />

            <div className="card animate-fade-in-up" style={{
                width: '100%', maxWidth: 500, padding: '44px 36px', border: '1px solid var(--border)',
            }}>
                <div style={{ textAlign: 'center', marginBottom: 28 }}>
                    <img src="/logo.svg" alt="Logo" style={{ width: 80, height: 80, margin: '0 auto 14px', objectFit: 'contain' }} />
                    <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Create Account</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: 6, fontSize: '0.9rem' }}>
                        Join UNIBOT and start learning smarter
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
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                        <div>
                            <label className="input-label">First Name</label>
                            <input className="input-field" name="first_name" placeholder="John"
                                value={form.first_name} onChange={handleChange} required />
                        </div>
                        <div>
                            <label className="input-label">Last Name</label>
                            <input className="input-field" name="last_name" placeholder="Doe"
                                value={form.last_name} onChange={handleChange} required />
                        </div>
                    </div>
                    <div style={{ marginBottom: 14 }}>
                        <label className="input-label">Username</label>
                        <input className="input-field" name="username" placeholder="johndoe"
                            value={form.username} onChange={handleChange} required />
                    </div>
                    <div style={{ marginBottom: 14 }}>
                        <label className="input-label">Email</label>
                        <input className="input-field" type="email" name="email" placeholder="john@university.edu"
                            value={form.email} onChange={handleChange} required />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                        <div>
                            <label className="input-label">Role</label>
                            <select className="input-field" name="role" value={form.role} onChange={handleChange}>
                                <option value="student">Student</option>
                                <option value="faculty">Faculty</option>
                            </select>
                        </div>
                        <div>
                            <label className="input-label">Department</label>
                            <input className="input-field" name="department" placeholder="Computer Science"
                                value={form.department} onChange={handleChange} />
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
                        <div>
                            <label className="input-label">Password</label>
                            <input className="input-field" type="password" name="password" placeholder="••••••••"
                                value={form.password} onChange={handleChange} required />
                        </div>
                        <div>
                            <label className="input-label">Confirm</label>
                            <input className="input-field" type="password" name="password_confirm" placeholder="••••••••"
                                value={form.password_confirm} onChange={handleChange} required />
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading}
                        style={{ width: '100%', padding: 14 }}>
                        {loading ? 'Creating...' : '🚀 Create Account'}
                    </button>
                </form>

                {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && !process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID.startsWith('your-') && (
                    <>
                        <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0', gap: 12 }}>
                            <div style={{ flex: 1, height: 1, background: 'var(--border-light)' }} />
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>OR</span>
                            <div style={{ flex: 1, height: 1, background: 'var(--border-light)' }} />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={() => setError('Google initialization failed.')}
                            />
                        </div>
                    </>
                )}

                <div style={{ textAlign: 'center', marginTop: 20, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                    Already have an account? <Link href="/login" style={{ fontWeight: 600 }}>Sign in</Link>
                </div>
            </div>
        </div>
    );
}
