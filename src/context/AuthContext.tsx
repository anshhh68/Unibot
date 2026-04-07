'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

/* ── Types ─────────────────────────────────────────────── */
export interface GoogleUser {
  sub: string;       // unique Google user ID
  name: string;
  email: string;
  picture: string;
  given_name: string;
  family_name: string;
}

interface AuthContextValue {
  user: GoogleUser | null;
  signIn: (credential: string) => void;
  signOut: () => void;
}

/* ── Helpers ────────────────────────────────────────────── */
function decodeJwt(token: string): GoogleUser {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const json = decodeURIComponent(
    atob(base64)
      .split('')
      .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
      .join('')
  );
  return JSON.parse(json) as GoogleUser;
}

/* ── Context ────────────────────────────────────────────── */
const AuthContext = createContext<AuthContextValue>({
  user: null,
  signIn: () => {},
  signOut: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<GoogleUser | null>(null);

  const signIn = useCallback((credential: string) => {
    try {
      const decoded = decodeJwt(credential);
      setUser(decoded);
    } catch (e) {
      console.error('Failed to decode Google credential JWT:', e);
    }
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    // Revoke GSI session so One Tap doesn't re-trigger immediately
    if (typeof window !== 'undefined' && window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect();
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
