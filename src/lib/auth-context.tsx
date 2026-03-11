'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { flushSync } from 'react-dom';
import { getProfile, login as apiLogin, logout as apiLogout, getTokens } from './api';


interface User {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    role: 'student' | 'faculty' | 'admin';
    phone?: string;
    department?: string;
    avatar_url?: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshUser = useCallback(async () => {
        try {
            const tokens = getTokens();
            if (!tokens) {
                setUser(null);
                return;
            }
            const profile = await getProfile();
            setUser(profile);
        } catch {
            setUser(null);
        }
    }, []);

    useEffect(() => {
        refreshUser().finally(() => setLoading(false));
    }, [refreshUser]);

    const login = async (username: string, password: string) => {
        const data = await apiLogin(username, password);
        // Use flushSync so React commits the state update synchronously
        // before the caller does router.push — prevents dashboard redirecting
        // back to login because it sees user=null on first render.
        flushSync(() => {
            setUser(data.user);
        });
    };



    const logout = () => {
        apiLogout();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
