'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useDeviceType } from '@/hooks/useDeviceType';
import { XPLoginCard } from '@/components/pc/XPLoginCard';
import { SymbianForm } from '@/components/mobile/SymbianForm';
import { SoftNavBar } from '@/components/mobile/SoftNavBar';

interface AuthViewProps {
    initialType: 'login' | 'register';
}

export function AuthView({ initialType }: AuthViewProps) {
    const [type, setType] = useState(initialType);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const deviceType = useDeviceType();
    const { user, login, register, loading: authLoading } = useAuth();

    React.useEffect(() => {
        if (!authLoading && user) {
            if (deviceType === 'mobile') {
                router.push('/menu');
            } else {
                router.push('/desktop');
            }
        }
    }, [user, authLoading, deviceType, router]);

    const handleAuth = async (email: string, pass: string) => {
        try {
            setIsLoading(true);
            setError(null);
            if (type === 'login') {
                await login(email, pass);
            } else {
                await register(email, pass);
            }

            // Redirect based on device
            if (deviceType === 'mobile') {
                router.push('/menu');
            } else {
                router.push('/desktop');
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Authentication failed';
            setError(message);
            alert(message);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleType = () => setType(type === 'login' ? 'register' : 'login');

    if (deviceType === null) return null; // Hydration guard

    if (deviceType === 'mobile') {
        return (
            <div className="fixed inset-0 flex flex-col bg-(--symbian-bg) symbian-ui">
                <div className="flex-1 flex flex-col overflow-hidden">
                    {error && (
                        <div className="bg-[#111111] text-red-500 border-b border-(--symbian-border) p-2 text-[10px] font-normal text-center leading-tight">
                            Error: {error}
                        </div>
                    )}
                    <SymbianForm
                        type={type}
                        isLoading={isLoading}
                        onSubmit={handleAuth}
                        onToggle={toggleType}
                    />
                </div>
                <SoftNavBar
                    leftLabel={isLoading ? 'Wait' : (type === 'login' ? 'Select' : 'OK')}
                    onLeftClick={() => {
                        const form = document.querySelector('form') as HTMLFormElement;
                        form?.requestSubmit();
                    }}
                    onRightClick={() => {
                        if (!isLoading) {
                            // In Nokia, Right Key was often "Exit" or "Back"
                            // Here it acts as the secondary action or "back"
                            toggleType();
                        }
                    }}
                    rightLabel={isLoading ? '...' : (type === 'login' ? 'Reg.' : 'Log in')}
                    disabled={isLoading}
                />
            </div>
        );
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-[#004E98] bg-[url('https://images.unsplash.com/photo-1549416878-19ca92f2680c?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center">
            <div className="flex flex-col gap-2">
                {error && (
                    <div className="xp-ui w-[360px] bg-[#FFFFE1] border border-black p-1 text-[10px] shadow-[2px_2px_0px_rgba(0,0,0,0.2)] flex items-start gap-1">
                        <span className="text-red-600 font-bold">(!)</span>
                        <span className="leading-tight tracking-tight">{error}</span>
                    </div>
                )}
                <XPLoginCard
                    type={type}
                    isLoading={isLoading}
                    onSubmit={handleAuth}
                    onToggle={toggleType}
                />
            </div>
        </div>
    );
}
