import React, { useState } from 'react';

interface SymbianFormProps {
    type: 'login' | 'register';
    isLoading?: boolean;
    onSubmit: (email: string, pass: string) => void;
    onToggle: () => void;
}

export function SymbianForm({ type, isLoading, onSubmit, onToggle }: SymbianFormProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Auth Logic: Transform simple username to email
        let finalEmail = email.toLowerCase().trim();
        if (finalEmail && !finalEmail.includes('@')) {
            finalEmail = `${finalEmail}@syllabus.os`;
        }

        onSubmit(finalEmail, password);
    };

    return (
        <div className="symbian-ui flex flex-col h-full overflow-hidden bg-(--symbian-bg) text-[11px] leading-tight">
            {/* Operator Bar - Hardware Status Icons */}
            <div className="h-6 px-1.5 flex justify-between items-center bg-(--symbian-status-bar) border-b border-(--symbian-border)">
                <div className="flex items-center gap-0.5">
                    {/* Signal bars */}
                    <div className="flex items-end gap-[1px] h-2">
                        <div className="w-[1.5px] h-[3px] bg-white" />
                        <div className="w-[1.5px] h-[5px] bg-white" />
                        <div className="w-[1.5px] h-[7px] bg-white" />
                        <div className="w-[1.5px] h-full bg-white/20" />
                    </div>
                    <span className="font-normal ml-0.5 text-white">Syllabus</span>
                </div>
                <div className="flex items-center gap-1">
                    <span className="font-normal text-[10px] text-white">12:00</span>
                    {/* Battery units */}
                    <div className="w-5 h-2.5 border border-white p-px flex gap-px">
                        <div className="flex-1 bg-white" />
                        <div className="flex-1 bg-white" />
                        <div className="flex-1 bg-white" />
                    </div>
                </div>
            </div>

            {/* Application Title Bar */}
            <div className="h-8 px-2 flex items-center bg-(--symbian-header) border-b border-(--symbian-border)">
                <span className="text-white font-normal uppercase tracking-wider">
                    {isLoading ? 'Processing...' : (type === 'login' ? 'Log in' : 'Register')}
                </span>
            </div>

            {/* Strict Menu List Area */}
            <form id="symbian-form" onSubmit={handleSubmit} className="flex-1 flex flex-col bg-(--symbian-bg)">
                <div className="flex flex-col">
                    {/* Row 1: Username Input */}
                    <div className="h-12 px-2 flex flex-col justify-center bg-(--symbian-row-bg) border-b border-(--symbian-border) group active:bg-(--symbian-row-highlight)">
                        <span className="text-(--symbian-text-dim) text-[10px] mb-0.5">Username:</span>
                        <input
                            type="text"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-transparent border-none outline-none p-0 text-white font-normal placeholder:text-white/20"
                            required
                            disabled={isLoading}
                            autoFocus
                        />
                    </div>

                    {/* Row 2: Password Input */}
                    <div className="h-12 px-2 flex flex-col justify-center bg-(--symbian-row-bg) border-b border-(--symbian-border) group active:bg-(--symbian-row-highlight)">
                        <span className="text-(--symbian-text-dim) text-[10px] mb-0.5">Password:</span>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-transparent border-none outline-none p-0 text-white font-normal"
                            required
                            disabled={isLoading}
                        />
                    </div>

                    {/* Row 3: Navigation Link / Toggle */}
                    <button
                        type="button"
                        onClick={onToggle}
                        disabled={isLoading}
                        className="h-12 px-2 w-full text-left bg-(--symbian-row-bg) border-b border-(--symbian-border) active:bg-(--symbian-row-highlight) flex items-center justify-between"
                    >
                        <span className="text-white">{type === 'login' ? 'Register new account' : 'Go back to login'}</span>
                        <span className="text-(--symbian-text-dim) font-normal">{'>'}</span>
                    </button>

                    {/* Additional Menu Item for Authenticity */}
                    <div className="h-12 px-2 flex items-center bg-(--symbian-row-bg) border-b border-(--symbian-border) opacity-40">
                        <span className="text-white">Connection: GSM</span>
                    </div>
                </div>

                {/* Loading Status Indicator (Embedded at the bottom of the list) */}
                {isLoading && (
                    <div className="px-2 py-3 bg-(--symbian-row-bg) border-b border-(--symbian-border) flex items-center gap-2">
                        <div className="w-3 h-3 border border-white border-t-transparent animate-spin" />
                        <span className="text-white italic">Establishing link...</span>
                    </div>
                )}
            </form>
        </div>
    );
}
