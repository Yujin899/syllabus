'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDeviceType } from '@/hooks/useDeviceType';
import { SymbianQuiz } from '@/components/mobile/SymbianQuiz';
import { SymbianHome } from '@/components/mobile/SymbianHome';
import { SymbianBrowser } from '@/components/mobile/SymbianBrowser';
import { SymbianWelcome } from '@/components/mobile/SymbianWelcome';
import { SymbianAdmin } from '@/components/mobile/SymbianAdmin';
import { Folder, FileText, Loader2, ArrowLeft, LayoutGrid, Layers, Globe, AlertCircle, Check, X } from 'lucide-react';
import {
    getSubjects,
    getQuizzes,
    getSubjectMistakes,
    listenToMistakes,
    Subject,
    Quiz,
    SubjectMistakes
} from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { AuthGuard } from '@/components/auth/AuthGuard';

type NavStackItem = {
    id: 'home' | 'menu' | 'subjects' | 'quizzes' | 'active-quiz' | 'about' | 'mistakes-report' | 'browser';
    data?: {
        id?: string;
        name?: string;
        mode?: 'normal' | 'mistakes'; // for subjects
        url?: string; // for browser
        content?: 'mistakes' | string;
        mistakesData?: SubjectMistakes;
        subjectId?: string; // for quizzes
        quizzes?: Quiz[];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [key: string]: any;
    };
};

export default function MenuPage() {
    const [stack, setStack] = useState<NavStackItem[]>([{ id: 'home' }]);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [showRecent, setShowRecent] = useState(false);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [mistakesCounts, setMistakesCounts] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const deviceType = useDeviceType();

    // Device-based redirect: if on desktop, go to /desktop
    useEffect(() => {
        if (deviceType === 'desktop') {
            router.push('/desktop');
        }
    }, [deviceType, router]);

    useEffect(() => {
        if (authLoading || !user) return;

        // Reactive mistakes listener
        const unsubscribe = listenToMistakes(user.uid, (counts) => {
            setMistakesCounts(counts);
        });

        // Still fetch subjects once (they rarely change in a single session)
        const fetchInitialData = async () => {
            try {
                const fetchedSubjects = await getSubjects();
                setSubjects(fetchedSubjects);
            } catch (error) {
                console.error("Failed to fetch subjects:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
        return () => unsubscribe();
    }, [user, authLoading]);

    const currentScreen = stack[stack.length - 1];

    // Menu logic is replaced by Home Screen apps, but we keep this for sub-menus if needed
    const handleOpenApp = (appId: 'my-files' | 'browser' | 'about') => {
        if (appId === 'my-files') {
            setStack([...stack, { id: 'subjects', data: { mode: 'normal' } }]);
            setSelectedIndex(0);
        } else if (appId === 'browser') {
            setStack([...stack, { id: 'browser', data: { url: 'about:home' } }]);
        } else if (appId === 'about') {
            setStack([...stack, { id: 'about' }]);
        }
    };

    const handleConfirm = async (id: string, data?: NavStackItem['data']) => {
        if (currentScreen.id === 'subjects' && data) {
            // If in "Mistakes" mode (opened from Mistakes App), go directly to mistakes report?
            // Or show quizzes list with mistakes?
            // "Mobile: "Mistakes" menu item inside subject list" was previous logic.
            // Now "Mistakes" app -> Select Subject -> Show Mistakes?

            const mode = currentScreen.data?.mode || 'normal';

            if (mode === 'mistakes') {
                // Fetch mistakes for this subject directly
                setLoading(true);
                try {
                    const mistakes = await getSubjectMistakes(user!.uid, data.id!);
                    // Check if there are mistakes?
                    if (mistakes && mistakes.quizzes.length > 0) {
                        // Open in Browser
                        const url = `file:///C:/My Files/${data.name}/Mistakes.pdf`;
                        setStack([...stack, { id: 'browser', data: { url, content: 'mistakes', mistakesData: mistakes || undefined } }]);
                    } else {
                        alert("No mistakes found for this subject.");
                    }
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(true);
                try {
                    const quizzes = await getQuizzes(data.id!);
                    setStack([...stack, { id: 'quizzes', data: { ...data, quizzes } }]);
                    setSelectedIndex(-1);
                } finally {
                    setLoading(false);
                }
            }
        } else if (currentScreen.id === 'quizzes' && data) {
            if (data.id === 'mistakes') {
                setLoading(true);
                try {
                    const mistakes = await getSubjectMistakes(user!.uid, currentScreen.data!.id!);
                    // Open in Browser
                    const url = `file:///C:/My Files/${currentScreen.data!.name}/Mistakes.pdf`;
                    setStack([...stack, { id: 'browser', data: { url, content: 'mistakes', mistakesData: mistakes || undefined } }]);
                    setSelectedIndex(-1);
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(true);
                try {
                    // Open Quiz in Browser
                    const url = `https://syllabus.edu/quiz/${data.id}`;
                    setStack([...stack, {
                        id: 'active-quiz', // keeping ID active-quiz for logic, but rendering browser
                        data: { ...data, subjectId: currentScreen.data!.id, url }
                    }]);
                } finally {
                    setLoading(false);
                }
            }
        }
    };

    const handleBack = () => {
        if (stack.length > 1) {
            const newStack = [...stack];
            newStack.pop();
            setStack(newStack);
            setSelectedIndex(-1);
        }
    };

    if (loading && currentScreen.id !== 'active-quiz') {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-[#446688]"> {/* Symbian BG */}
                <Loader2 className="w-8 h-8 animate-spin text-white" />
            </div>
        );
    }


    // Helper to get Header Title
    const getHeaderTitle = () => {
        switch (currentScreen.id) {
            case 'home': return 'Menu';
            case 'subjects': return currentScreen.data?.mode === 'mistakes' ? 'Mistakes' : 'My Files';
            case 'quizzes': return currentScreen.data?.name;
            case 'mistakes-report': return 'Mistakes Report';
            case 'browser': return 'Web';
            case 'about': return 'About';
            default: return 'Syllabus';
        }
    };

    const handleNavigate = (url: string) => {
        const newStack = [...stack];
        const currentItem = newStack[newStack.length - 1];
        if (currentItem.id === 'browser') {
            currentItem.data = { ...currentItem.data, url };
            setStack(newStack);
        }
    };

    return (
        <AuthGuard>
            <div className="fixed inset-0 flex flex-col bg-[#000] symbian-ui select-none">
                {/* Operator/Status Bar */}
                {currentScreen.id !== 'browser' && currentScreen.id !== 'active-quiz' && (
                    <div className="h-6 px-2 flex justify-between items-center bg-(--symbian-status-bar) border-b border-(--symbian-border) text-[9px] text-white shrink-0">
                        <div className="flex items-center gap-1">
                            <span className="font-bold">Syllabus</span>
                        </div>
                        <span className="font-medium">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                    </div>
                )}

                {/* Header / Title Bar */}
                {currentScreen.id !== 'home' && currentScreen.id !== 'browser' && currentScreen.id !== 'active-quiz' && (
                    <div className="h-10 bg-(--symbian-header) border-b border-(--symbian-border) flex items-center px-3 shrink-0">
                        <span className="text-white text-sm font-normal uppercase tracking-wider truncate">
                            {getHeaderTitle()}
                        </span>
                    </div>
                )}

                {/* Content Area */}
                <div className="flex-1 flex flex-col overflow-hidden relative">
                    {currentScreen.id === 'home' && (
                        <SymbianHome onOpenApp={handleOpenApp} />
                    )}

                    {currentScreen.id === 'subjects' && (
                        <div className="flex-1 flex flex-col bg-(--symbian-bg) overflow-y-auto no-scrollbar">
                            {/* Show Subjects List */}
                            {subjects.map((subject, idx) => (
                                <div
                                    key={subject.id}
                                    onClick={() => {
                                        setSelectedIndex(idx);
                                        handleConfirm('quizzes', subject);
                                    }}
                                    className={cn(
                                        "h-14 px-4 flex items-center border-b border-(--symbian-border) gap-3 shrink-0 active:bg-(--symbian-row-highlight) active:text-white transition-colors",
                                        idx === selectedIndex ? "bg-(--symbian-row-highlight) text-white" : "bg-(--symbian-row-bg) text-(--symbian-text)"
                                    )}
                                >
                                    <Folder className="w-9 h-9 shrink-0 text-[#FFCC00] fill-[#FFCC00] drop-shadow-sm" />
                                    <div className="flex flex-col overflow-hidden">
                                        <span className="text-sm font-normal truncate">{subject.name}</span>
                                        <span className="text-[10px] opacity-60 truncate max-w-[200px] font-sans">Folder</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {currentScreen.id === 'quizzes' && currentScreen.data && (
                        <div className="flex-1 flex flex-col bg-(--symbian-bg) overflow-y-auto no-scrollbar">

                            {/* Mistakes Folder */}
                            {mistakesCounts[currentScreen.data!.id!] > 0 && (
                                <div
                                    onClick={() => {
                                        setSelectedIndex(-1);
                                        handleConfirm('quizzes', { id: 'mistakes' });
                                    }}
                                    className={cn(
                                        "h-14 px-4 flex items-center border-b border-(--symbian-border) gap-3 shrink-0 active:bg-(--symbian-row-highlight) active:text-white transition-colors",
                                        "bg-(--symbian-row-bg) text-(--symbian-text)"
                                    )}
                                >
                                    <Folder className="w-9 h-9 shrink-0 text-[#FF4444] fill-[#FF4444] drop-shadow-sm" />
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold truncate">Mistakes</span>
                                        <span className="text-[10px] opacity-60 uppercase italic">Folder ({mistakesCounts[currentScreen.data!.id!]} items)</span>
                                    </div>
                                </div>
                            )}

                            {currentScreen.data.quizzes?.map((quiz: Quiz, idx: number) => (
                                <div
                                    key={quiz.id}
                                    onClick={() => {
                                        setSelectedIndex(idx);
                                        handleConfirm('active-quiz', quiz);
                                    }}
                                    className={cn(
                                        "h-14 px-4 flex items-center border-b border-(--symbian-border) gap-3 shrink-0 active:bg-(--symbian-row-highlight) active:text-white transition-colors",
                                        idx === selectedIndex ? "bg-(--symbian-row-highlight) text-white" : "bg-(--symbian-row-bg) text-(--symbian-text)"
                                    )}
                                >
                                    <FileText className="w-8 h-8 shrink-0 text-[#88BBFF] drop-shadow-sm" />
                                    <div className="flex flex-col">
                                        <span className="text-sm font-normal">{quiz.title}</span>
                                        <span className="text-[10px] opacity-60 uppercase font-sans">QUIZ FILE</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {currentScreen.id === 'browser' && (
                        <SymbianBrowser
                            url={currentScreen.data?.url || 'about:home'}
                            onBack={handleBack}
                            onNavigate={handleNavigate}
                        >
                            {currentScreen.data?.url === 'about:home' ? (
                                <SymbianWelcome />
                            ) : currentScreen.data?.url?.includes('admin') ? (
                                <SymbianAdmin />
                            ) : currentScreen.data?.content === 'mistakes' ? (
                                <div className="flex flex-col bg-[#121212] min-h-full text-white font-sans">
                                    {/* Symbian Header */}
                                    <div className="h-10 bg-[#1E1E1E] border-b border-[#333] flex items-center px-3 justify-between shrink-0">
                                        <span className="text-white text-sm font-normal uppercase tracking-wider">Mistakes Log</span>
                                        <FileText className="w-4 h-4 text-[#FF4444]" />
                                    </div>

                                    <div className="p-3 overflow-y-auto flex-1 flex flex-col gap-4 no-scrollbar">
                                        {(currentScreen.data?.mistakesData as SubjectMistakes)?.quizzes.map((quiz) => (
                                            <div key={quiz.quizId} className="flex flex-col gap-1">
                                                <div className="px-2 py-1 bg-[#222] border border-[#333] rounded-sm flex items-center gap-2 mb-1">
                                                    <AlertCircle className="w-3 h-3 text-[#FFCC00]" />
                                                    <span className="text-xs font-bold text-[#CCC]">{quiz.quizTitle}</span>
                                                </div>
                                                <div className="flex flex-col gap-3 pl-2 border-l border-[#333] ml-2 pb-2">
                                                    {quiz.questions.map((m, mIdx) => (
                                                        <div key={mIdx} className="bg-[#1A1A1A] border border-[#333] p-3 rounded-sm flex flex-col gap-2 relative">
                                                            <p className="text-sm text-white font-normal leading-snug pr-4">{m.questionText}</p>

                                                            <div className="flex flex-col gap-2 mt-2">
                                                                {m.options?.map((opt) => {
                                                                    const isSelected = m.selectedOptionIds.includes(opt.id);
                                                                    const isCorrect = m.correctOptionIds.includes(opt.id);

                                                                    let styleClass = "bg-[#111] border-[#333] text-[#888]";
                                                                    if (isCorrect) styleClass = "bg-[#0B330B] border-[#228822] text-white";
                                                                    else if (isSelected) styleClass = "bg-[#330B0B] border-[#882222] text-white";

                                                                    return (
                                                                        <div key={opt.id} className={cn("px-3 py-2 text-xs border rounded-sm flex items-center justify-between", styleClass)}>
                                                                            <span>{opt.text}</span>
                                                                            {isCorrect && <Check className="w-3 h-3 text-[#44BB44]" />}
                                                                            {isSelected && !isCorrect && <X className="w-3 h-3 text-[#FF4444]" />}
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>

                                                            {m.explanation && (
                                                                <div className="text-[10px] text-[#666] italic border-t border-[#333] pt-2 mt-1">
                                                                    {m.explanation}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                        {!(currentScreen.data.mistakesData as SubjectMistakes)?.quizzes.length && (
                                            <div className="text-center text-[#666] text-xs py-8 opacity-50">
                                                <div className="mb-2 text-2xl">¯\_(ツ)_/¯</div>
                                                No mistakes found.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full p-4 text-[#888]">
                                    <Globe className="w-16 h-16 mb-4 text-blue-500 opacity-50" />
                                    <div className="text-center">
                                        <h2 className="text-lg font-bold text-blue-400 mb-2">Loading Page...</h2>
                                        <p className="text-xs">{currentScreen.data?.url}</p>
                                    </div>
                                </div>
                            )}
                        </SymbianBrowser>
                    )}

                    {currentScreen.id === 'active-quiz' && (
                        <SymbianBrowser url={currentScreen.data?.url || 'about:blank'} onBack={handleBack}>
                            <div className="h-full overflow-hidden select-none">
                                <SymbianQuiz quiz={currentScreen.data as unknown as Quiz} subjectId={currentScreen.data!.subjectId!} onBack={handleBack} />
                            </div>
                        </SymbianBrowser>
                    )}

                    {currentScreen.id === 'about' && (
                        <div className="flex-1 flex flex-col p-4 bg-(--symbian-bg) text-white gap-4 overflow-y-auto no-scrollbar">
                            <div className="bg-(--symbian-row-bg) border border-(--symbian-border) p-3 flex flex-col gap-2">
                                <span className="text-base font-normal">Syllabus Mobile</span>
                                <span className="text-[11px] text-(--symbian-text-dim)">v1.6.0 Symbian OS</span>
                            </div>
                            <p className="text-[11px] leading-relaxed text-(--symbian-text-dim)">
                                Phase 11: File System & Browser.
                                Manage files and browse the web.
                            </p>
                        </div>
                    )}

                    {/* Recent Apps Modal (Mock) */}
                    {showRecent && (
                        <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setShowRecent(false)}>
                            <div className="bg-(--symbian-row-bg) border border-(--symbian-border) p-4 shadow-xl w-3/4 max-w-sm rounded-sm">
                                <h3 className="text-white text-xs font-bold mb-2 border-b border-white/20 pb-1">Recent Apps</h3>
                                <div className="flex flex-col gap-1">
                                    <div className="p-2 bg-white/10 text-white text-[10px] flex items-center gap-2">
                                        <Folder className="w-3 h-3" /> My Files
                                    </div>
                                    <div className="p-2 bg-transparent text-white/50 text-[10px] flex items-center gap-2">
                                        <Globe className="w-3 h-3" /> Browser
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Touch Navigation Bar */}
                <div className="h-12 bg-[#111] border-t border-[#333] flex items-center justify-around text-white z-40 shrink-0">
                    {/* Back Button */}
                    <button
                        onClick={handleBack}
                        className="flex flex-col items-center justify-center w-16 h-full active:bg-[#333] transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 opacity-80" />
                    </button>

                    {/* Home Button */}
                    <button
                        onClick={() => {
                            setStack([{ id: 'home' }]);
                            setSelectedIndex(-1);
                        }}
                        className="flex flex-col items-center justify-center w-16 h-full active:bg-[#333] transition-colors"
                    >
                        <LayoutGrid className="w-5 h-5 opacity-80" />
                    </button>

                    {/* Recent Apps Button */}
                    <button
                        onClick={() => setShowRecent(true)}
                        className="flex flex-col items-center justify-center w-16 h-full active:bg-[#333] transition-colors"
                    >
                        <Layers className="w-5 h-5 opacity-80" />
                    </button>
                </div>
            </div>
        </AuthGuard>
    );
}
