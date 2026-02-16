'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDeviceType } from '@/hooks/useDeviceType';
import { DesktopIcon } from '@/components/pc/DesktopIcon';
import { XPWindow } from '@/components/pc/XPWindow';
import { SyllabusBrowser } from '@/components/pc/SyllabusBrowser';
import { XPStartMenu } from '@/components/pc/XPStartMenu';
import {
    getSubjects,
    getQuizzes,
    getMistakesCount,
    getSubjectMistakes,
    Subject,
    Quiz,
    SubjectMistakes
} from '@/lib/firebase';
import { FileText, Loader2, Folder as FolderIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { AuthGuard } from '@/components/auth/AuthGuard';
import Image from 'next/image';

interface ActiveWindow {
    id: string;
    type: 'subjects' | 'quizzes' | 'about' | 'browser' | 'mistakes';
    title: string;
    data?: {
        id?: string;
        name?: string;
        quizzes?: Quiz[];
        quiz?: Quiz;
        subjectId?: string;
        view?: 'quiz' | 'mistakes';
        mistakes?: SubjectMistakes;
    };
    x: number;
    y: number;
    isMaximized: boolean;
    isMinimized: boolean;
}

export default function DesktopPage() {
    const [windows, setWindows] = useState<ActiveWindow[]>([]);
    const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
    const [mistakesCounts, setMistakesCounts] = useState<Record<string, number>>({});
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const deviceType = useDeviceType();

    // Device-based redirect
    useEffect(() => {
        if (deviceType === 'mobile') {
            router.push('/menu');
        }
    }, [deviceType, router]);

    useEffect(() => {
        if (authLoading) return;

        const fetchInitialData = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                const fetchedSubjects = await getSubjects();
                setSubjects(fetchedSubjects);

                const counts: Record<string, number> = {};
                for (const s of fetchedSubjects) {
                    const count = await getMistakesCount(user.uid, s.id);
                    counts[s.id] = count;
                }
                setMistakesCounts(counts);
            } catch (error) {
                console.error("Failed to fetch subjects:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, [user, authLoading]);

    const openWindow = async (type: ActiveWindow['type'], data?: ActiveWindow['data'] | string) => {
        let id: string = type;
        let title = type === 'subjects' ? 'Subjects' :
            type === 'browser' ? 'Syllabus Browser' :
                'About Syllabus';
        let windowData: ActiveWindow['data'] = typeof data === 'string' ? { id: data, subjectId: data } : data;

        if (type === 'quizzes' && windowData) {
            id = `quizzes-${windowData.id}`;
            title = windowData.name || 'Quizzes';
            if (!windowData.quizzes && windowData.id) {
                const quizzes = await getQuizzes(windowData.id);
                windowData = { ...windowData, quizzes };
            }
        }

        if (type === 'browser' && windowData) {
            const quiz = windowData.quiz || (windowData as unknown as Quiz);
            const quizId = (quiz as Quiz).id;
            const subjectId = windowData.subjectId || subjects.find(s => s.quizzes?.some(q => q.id === quizId))?.id;

            title = `Syllabus Browser - ${(quiz as Quiz).title}`;
            windowData = { quiz: quiz as Quiz, subjectId, view: windowData.view || 'quiz' };

            const browserWin = windows.find(w => w.type === 'browser');
            if (browserWin) {
                setWindows(windows.map(w =>
                    w.id === browserWin.id ? { ...w, title, data: windowData, isMinimized: false } : w
                ));
                return;
            }
        }

        if (type === 'mistakes' && windowData) {
            const sId = windowData.subjectId || windowData.id || (typeof data === 'string' ? data : '');
            id = `mistakes-${sId}`;
            title = `Mistakes`;
            const mistakesData = await getSubjectMistakes(user!.uid, sId);
            windowData = { subjectId: sId, mistakes: mistakesData || undefined };
        }

        const existing = windows.find(w => w.id === id);
        if (existing) {
            setWindows([...windows.filter(w => w.id !== id), { ...existing, isMinimized: false }]);
            return;
        }

        const offset = windows.length * 25;
        const newWindow: ActiveWindow = {
            id,
            type,
            title,
            data: windowData,
            x: 100 + offset,
            y: 80 + offset,
            isMaximized: false,
            isMinimized: false
        };

        setWindows([...windows, newWindow]);
    };

    const closeWindow = (id: string) => {
        setWindows(windows.filter(w => w.id !== id));
    };

    const toggleMaximize = (id: string) => {
        setWindows(windows.map(w =>
            w.id === id ? { ...w, isMaximized: !w.isMaximized } : w
        ));
    };

    const toggleMinimize = (id: string) => {
        setWindows(windows.map(w =>
            w.id === id ? { ...w, isMinimized: !w.isMinimized } : w
        ));
    };

    const focusWindow = (id: string) => {
        const win = windows.find(w => w.id === id);
        if (win) {
            setWindows([...windows.filter(w => w.id !== id), { ...win, isMinimized: false }]);
        }
    };

    return (
        <AuthGuard>
            <div
                className="fixed inset-0 xp-ui overflow-hidden select-none bg-cover bg-center"
                style={{ backgroundImage: 'url("/windows/windows-bg.webp")' }}
                onClick={() => {
                    setSelectedIcon(null);
                    setIsStartMenuOpen(false);
                }}
            >
                {/* Desktop Icons */}
                <div className="p-2 flex flex-col flex-wrap gap-0 h-[calc(100%-40px)] w-fit">
                    <DesktopIcon
                        id="subjects"
                        label="Subjects"
                        icon={null}
                        selected={selectedIcon === 'subjects'}
                        onSelect={setSelectedIcon}
                        onOpen={() => openWindow('subjects')}
                    />
                    <DesktopIcon
                        id="browser"
                        label="Syllabus Browser"
                        icon={<Image src="/windows/browser.png" width={32} height={32} className="crisp-edges" alt="" />}
                        selected={selectedIcon === 'browser'}
                        onSelect={setSelectedIcon}
                        onOpen={() => openWindow('browser')}
                    />
                    <DesktopIcon
                        id="about"
                        label="About Syllabus"
                        icon={<Image src="/windows/about.png" width={32} height={32} className="crisp-edges" alt="" />}
                        selected={selectedIcon === 'about'}
                        onSelect={setSelectedIcon}
                        onOpen={() => openWindow('about')}
                    />
                </div>

                {/* Render Active Windows */}
                {windows.map((win) => {
                    if (win.isMinimized) return null;

                    return (
                        <XPWindow
                            key={win.id}
                            id={win.id}
                            title={win.title}
                            defaultX={win.x}
                            defaultY={win.y}
                            isMaximized={win.isMaximized}
                            onMaximize={() => toggleMaximize(win.id)}
                            onMinimize={() => toggleMinimize(win.id)}
                            onClose={() => closeWindow(win.id)}
                            icon={win.type === 'browser' ? "/windows/browser.png" :
                                win.type === 'about' ? "/windows/about.png" : "/windows/folder.png"}
                        >
                            {win.type === 'subjects' && (
                                <div className="flex flex-col bg-white h-full overflow-hidden">
                                    {loading ? (
                                        <div className="flex-1 flex items-center justify-center bg-white">
                                            <Loader2 className="w-6 h-6 animate-spin text-[#003399]" />
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex border-b border-[#CCC] bg-[#F1F1F1] h-6 items-center text-[10px] font-normal px-2 sticky top-0 shrink-0">
                                                <div className="w-1/2 border-r border-[#CCC] px-1 text-black">Name</div>
                                                <div className="flex-1 px-1 text-black">Type</div>
                                            </div>
                                            <div className="flex-1 overflow-auto">
                                                {subjects.map(subject => (
                                                    <div
                                                        key={subject.id}
                                                        className="flex items-center h-5 px-2 hover:bg-[#316AC5] hover:text-white cursor-default group text-black bg-white"
                                                        onDoubleClick={(e) => {
                                                            e.stopPropagation();
                                                            openWindow('quizzes', subject);
                                                        }}
                                                    >
                                                        <div className="w-1/2 flex items-center gap-2 overflow-hidden">
                                                            <Image
                                                                src="/windows/folder.png"
                                                                alt=""
                                                                width={16}
                                                                height={16}
                                                                className="shrink-0 crisp-edges"
                                                                draggable={false}
                                                            />
                                                            <span className="truncate text-xs">{subject.name}</span>
                                                        </div>
                                                        <div className="flex-1 px-1 text-[#444] group-hover:text-white/90 text-xs">
                                                            File Folder
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            {win.type === 'quizzes' && win.data && (
                                <div className="flex flex-col bg-white h-full overflow-hidden">
                                    <div className="flex border-b border-[#CCC] bg-[#F1F1F1] h-6 items-center text-[10px] font-normal px-2 sticky top-0 shrink-0">
                                        <div className="w-1/2 border-r border-[#CCC] px-1 text-black">Name</div>
                                        <div className="flex-1 px-1 text-black">Type</div>
                                    </div>
                                    <div className="flex-1 overflow-auto">
                                        {win.data.quizzes?.map((quiz: Quiz) => (
                                            <div
                                                key={quiz.id}
                                                className="flex items-center h-5 px-2 hover:bg-[#316AC5] hover:text-white cursor-default group text-black bg-white"
                                                onDoubleClick={() => openWindow('browser', { quiz, subjectId: win.data?.id })}
                                            >
                                                <div className="w-1/2 flex items-center gap-2 overflow-hidden">
                                                    <FileText className="w-4 h-4 text-[#3366CC] shrink-0" />
                                                    <span className="truncate text-xs">{quiz.title}</span>
                                                </div>
                                                <div className="flex-1 px-1 text-[#444] group-hover:text-white/90 text-xs">
                                                    QUIZ File
                                                </div>
                                            </div>
                                        ))}

                                        {/* Dynamic Mistakes Folder */}
                                        {win.data.id && mistakesCounts[win.data.id] > 0 && (
                                            <div
                                                className="flex items-center h-5 px-2 hover:bg-[#316AC5] hover:text-white cursor-default group text-black bg-white font-bold"
                                                onClick={() => openWindow('mistakes', win.data?.id || '')}
                                            >
                                                <div className="w-1/2 flex items-center gap-2 overflow-hidden">
                                                    <FolderIcon className="w-4 h-4 text-[#FFCC00] shrink-0 fill-[#FFCC00]" />
                                                    <span className="truncate text-xs">Mistakes</span>
                                                </div>
                                                <div className="flex-1 px-1 text-[#444] group-hover:text-white/90 text-[10px] italic">
                                                    System Folder ({mistakesCounts[win.data.id]} items)
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {win.type === 'mistakes' && win.data && (
                                <div className="flex flex-col bg-white h-full overflow-hidden">
                                    <div className="flex border-b border-[#CCC] bg-[#F1F1F1] h-6 items-center text-[10px] font-normal px-2 sticky top-0 shrink-0">
                                        <div className="w-1/2 border-r border-[#CCC] px-1 text-black">Name</div>
                                        <div className="flex-1 px-1 text-black">Type</div>
                                    </div>
                                    <div className="flex-1 overflow-auto">
                                        {(win.data.mistakes as SubjectMistakes)?.quizzes?.map((q) => (
                                            <div
                                                key={q.quizId}
                                                className="flex items-center h-5 px-2 hover:bg-[#316AC5] hover:text-white cursor-default group text-black bg-white"
                                                onDoubleClick={() => openWindow('browser', {
                                                    quiz: { id: q.quizId, title: q.quizTitle },
                                                    subjectId: win.data?.subjectId,
                                                    view: 'mistakes'
                                                })}
                                            >
                                                <div className="w-1/2 flex items-center gap-2 overflow-hidden">
                                                    <FileText className="w-4 h-4 text-[#CC3300] shrink-0" />
                                                    <span className="truncate text-xs">{q.quizTitle}.mistakes</span>
                                                </div>
                                                <div className="flex-1 px-1 text-[#444] group-hover:text-white/90 text-xs">
                                                    Mistakes File
                                                </div>
                                            </div>
                                        ))}
                                        {(!win.data?.mistakes?.quizzes || win.data.mistakes.quizzes.length === 0) && (
                                            <div className="p-4 text-xs italic text-gray-500">No mistakes found.</div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {win.type === 'browser' && (
                                <SyllabusBrowser
                                    quiz={win.data?.quiz}
                                    subjectId={win.data?.subjectId}
                                    initialView={win.data?.view}
                                />
                            )}

                            {win.type === 'about' && (
                                <div className="p-4 flex flex-col gap-4 text-black bg-[#ECE9D8] h-full overflow-auto">
                                    <div className="flex gap-4 items-start">
                                        <Image src="/windows/folder.png" width={48} height={48} className="shadow-[1px_1px_2px_black] shrink-0 crisp-edges" alt="" />
                                        <div className="space-y-1">
                                            <h1 className="text-sm font-bold">Microsoft 2006 (Syllabus)</h1>
                                            <p className="text-[10px]">Version 1.5.0.1 (Firestore)</p>
                                            <p className="text-[10px] border-t border-[#CCC] pt-2 mt-2">
                                                Phase 8: Mistakes System enabled.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="bg-white border border-inset border-[#808080] p-3 text-[10px] leading-tight">
                                        License: GDM-FIRESTORE-P8
                                    </div>
                                </div>
                            )}
                        </XPWindow>
                    );
                })}

                {/* Start Menu */}
                {isStartMenuOpen && (
                    <XPStartMenu
                        onOpenWindow={openWindow}
                        onClose={() => setIsStartMenuOpen(false)}
                    />
                )}

                {/* Official XP Taskbar */}
                <div className="fixed bottom-0 left-0 right-0 h-[30px] bg-linear-to-b from-[#245ED1] via-[#3973D1] to-[#1941A5] border-t border-[#002266] flex items-center px-0 z-50">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsStartMenuOpen(!isStartMenuOpen);
                        }}
                        className="h-full px-4 bg-linear-to-b from-[#388E3C] via-[#4CAF50] to-[#2E7D32] border-r border-[#1B5E20] flex items-center gap-1 shadow-[inset_1px_1px_1px_rgba(255,255,255,0.4)] active:brightness-90"
                    >
                        <span className="text-white text-sm font-bold italic tracking-tighter drop-shadow-[1px_1px_1px_black]">start</span>
                    </button>

                    <div className="flex-1 flex items-center px-1 gap-1 overflow-x-auto no-scrollbar">
                        {windows.map(win => (
                            <div
                                key={`task-${win.id}`}
                                onClick={() => win.isMinimized ? focusWindow(win.id) : toggleMinimize(win.id)}
                                className={cn(
                                    "h-[24px] px-2 border border-[#1941A5] flex items-center gap-2 min-w-[100px] max-w-[160px] shadow-[inset_1px_1px_1px_rgba(255,255,255,0.2)] cursor-default select-none group",
                                    win.isMinimized ? "bg-[#1A52B3] active:bg-[#0E3A85]" : "bg-[#3D7BDD] active:bg-[#2A66C2]"
                                )}>
                                <Image src={win.type === 'subjects' || win.type === 'quizzes' ? "/windows/folder.png" : "/windows/ie.png"} width={16} height={16} alt="" />
                                <span className="text-white text-xs truncate max-w-[100px]">{win.title}</span>
                            </div>
                        ))}
                    </div>

                    <div className="h-full px-2 bg-[#1288E3] border-l border-[#0B69B1] flex items-center gap-3 text-white text-[10px] shadow-[inset_1px_0px_0px_rgba(255,255,255,0.2)]">
                        <span className="tracking-tight" suppressHydrationWarning>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                </div>
            </div>
        </AuthGuard>
    );
}
