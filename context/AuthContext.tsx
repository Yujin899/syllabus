'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    onAuthStateChanged,
    User,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut
} from 'firebase/auth';
import { auth, getUserProfile, createInitialProfile, UserProfile } from '@/lib/firebase';

interface AuthContextType {
    user: User | null;
    profile: UserProfile | null;
    loading: boolean;
    login: (email: string, pass: string) => Promise<void>;
    register: (email: string, pass: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            console.log('AuthContext: onAuthStateChanged - user:', user?.email);
            if (user) {
                setUser(user);
                try {
                    let userProfile = await getUserProfile(user.uid);
                    console.log('AuthContext: Initial Profile fetch:', userProfile?.role);

                    if (!userProfile) {
                        console.log('AuthContext: No profile found, creating initial...');
                        await createInitialProfile(user.uid, user.email || '');
                        userProfile = await getUserProfile(user.uid);
                        console.log('AuthContext: Profile after creation:', userProfile?.role);
                    }

                    if (userProfile?.status === 'banned') {
                        console.warn('AuthContext: User is banned');
                        await signOut(auth);
                        setUser(null);
                        setProfile(null);
                    } else {
                        setProfile(userProfile);
                    }
                } catch (err) {
                    console.error('AuthContext: Error fetching profile:', err);
                    setProfile(null);
                }
            } else {
                setUser(null);
                setProfile(null);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const login = async (email: string, pass: string) => {
        await signInWithEmailAndPassword(auth, email, pass);
    };

    const register = async (email: string, pass: string) => {
        const { user } = await createUserWithEmailAndPassword(auth, email, pass);
        await createInitialProfile(user.uid, user.email || '');
    };

    const logout = async () => {
        await signOut(auth);
    };

    return (
        <AuthContext.Provider value={{ user, profile, loading, login, register, logout }}>
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
