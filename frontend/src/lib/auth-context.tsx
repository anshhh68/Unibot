'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
        await apiLogin(username, password);
        await refreshUser();
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
