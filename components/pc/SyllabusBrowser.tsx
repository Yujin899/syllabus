'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    ArrowLeft,
    ArrowRight,
    RefreshCw,
    Home,
    Search,
    Printer,
} from 'lucide-react';
import Image from 'next/image';
import { Quiz, SubjectMistakes, getSubjectMistakes } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { XPQuiz } from './XPQuiz';
import { WelcomeScreen } from './WelcomeScreen';
import { AdminTool } from './AdminTool';
import { cn } from '@/lib/utils';

interface SyllabusBrowserProps {
    quiz?: Quiz | null;
    subjectId?: string | null;
    initialView?: 'welcome' | 'admin' | 'quiz' | 'mistakes';
}

export function SyllabusBrowser({ quiz, subjectId, initialView = 'welcome' }: SyllabusBrowserProps) {
    const { user } = useAuth();
    const [url, setUrl] = useState('http://syllabus.local/welcome');
    const [view, setView] = useState<'welcome' | 'admin' | 'quiz' | 'mistakes'>(initialView);
    const [mistakesData, setMistakesData] = useState<SubjectMistakes | null>(null);
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState<string[]>([url]);
    const [historyIndex, setHistoryIndex] = useState(0);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Sync view state when props change (e.g. opening a new quiz from Desktop)
    useEffect(() => {
        if (initialView) {
            setView(initialView);
        }
    }, [initialView, quiz, subjectId]);

    const fetchMistakes = useCallback(async () => {
        if (!user || !subjectId) return;
        setLoading(true);
        try {
            const data = await getSubjectMistakes(user.uid, subjectId);
            setMistakesData(data);
        } catch (err) {
            console.error("Failed to fetch mistakes:", err);
        } finally {
            setLoading(false);
        }
    }, [user, subjectId]);

    useEffect(() => {
        let newUrl = url;
        if (view === 'quiz' && quiz) {
            newUrl = `http://syllabus.local/quiz/${quiz.id}`;
        } else if (view === 'mistakes' && subjectId) {
            newUrl = `http://syllabus.local/mistakes/${subjectId}`;
            fetchMistakes();
        } else if (view === 'admin') {
            newUrl = 'http://syllabus.local/admin';
        } else if (view === 'welcome') {
            newUrl = 'http://syllabus.local/welcome';
        }

        if (newUrl !== url) {
            setUrl(newUrl);
            if (newUrl !== history[historyIndex]) {
                const newHistory = history.slice(0, historyIndex + 1);
                newHistory.push(newUrl);
                setHistory(newHistory);
                setHistoryIndex(newHistory.length - 1);
            }
        }
    }, [view, quiz, subjectId, fetchMistakes, url, history, historyIndex]);

    const [inputUrl, setInputUrl] = useState(url);

    // Sync inputUrl when actual url changes (navigation)
    useEffect(() => {
        setInputUrl(url);
    }, [url]);

    const handleGo = () => {
        const cleanUrl = inputUrl.toLowerCase().trim();
        let newView: typeof view = view;

        if (cleanUrl.includes('syllabus.local/admin')) {
            newView = 'admin';
        } else if (cleanUrl.includes('syllabus.local/welcome')) {
            newView = 'welcome';
        } else if (cleanUrl.includes('syllabus.local/mistakes/')) {
            newView = 'mistakes';
        } else if (cleanUrl.includes('syllabus.local/quiz/')) {
            newView = 'quiz';
        }

        if (newView !== view) {
            setView(newView);
        } else {
            if (inputUrl !== history[historyIndex]) {
                // Determine if we should treat this as a navigation (if params supported in future)
            }
        }
    };

    const handleBack = () => {
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            navigateToIndex(newIndex);
        }
    };

    const handleForward = () => {
        if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            navigateToIndex(newIndex);
        }
    };

    const navigateToIndex = (index: number) => {
        const targetUrl = history[index];
        setUrl(targetUrl);
        if (targetUrl.includes('/admin')) setView('admin');
        else if (targetUrl.includes('/welcome')) setView('welcome');
        else if (targetUrl.includes('/mistakes/')) setView('mistakes');
        else if (targetUrl.includes('/quiz/')) setView('quiz');
    };

    const handleRefresh = () => {
        if (view === 'mistakes') fetchMistakes();
    };

    const handleHome = () => {
        setView('welcome');
    };

    const handlePrint = () => {
        window.print();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleGo();
        }
    };

    const handleSearch = () => {
        setIsSearchOpen(!isSearchOpen);
    };

    return (
        <div className="flex flex-col h-full bg-[#ECE9D8] select-none relative overflow-hidden">
            {/* IE6 Style Toolbar */}
            <div className="p-1 border-b border-white flex flex-col gap-1 no-print">
                {/* Main Buttons */}
                <div className="flex items-center gap-1">
                    <button
                        className="flex flex-col items-center px-2 py-0.5 border border-transparent hover:border-[#808080] hover:bg-white/30 rounded-sm disabled:opacity-30"
                        onClick={handleBack}
                        disabled={historyIndex === 0}
                    >
                        <ArrowLeft className="w-5 h-5 text-[#3366CC]" />
                        <span className="text-[10px] text-black">Back</span>
                    </button>
                    <button
                        className="flex flex-col items-center px-2 py-0.5 border border-transparent hover:border-[#808080] hover:bg-white/30 rounded-sm disabled:opacity-30"
                        onClick={handleForward}
                        disabled={historyIndex >= history.length - 1}
                    >
                        <ArrowRight className="w-5 h-5 text-[#3366CC]" />
                        <span className="text-[10px] text-black">Forward</span>
                    </button>
                    <div className="w-px h-8 bg-[#808080]/30 mx-1" />
                    <button
                        className="flex flex-col items-center px-2 py-0.5 border border-transparent hover:border-[#808080] hover:bg-white/30 rounded-sm"
                        onClick={handleRefresh}
                    >
                        <RefreshCw className="w-4 h-4 text-[#3366CC]" />
                        <span className="text-[10px] text-black">Refresh</span>
                    </button>
                    <button
                        onClick={handleHome}
                        className="flex flex-col items-center px-2 py-0.5 border border-transparent hover:border-[#808080] hover:bg-white/30 rounded-sm"
                    >
                        <Home className="w-4 h-4 text-[#3366CC]" />
                        <span className="text-[10px] text-black">Home</span>
                    </button>
                    <div className="w-px h-8 bg-[#808080]/30 mx-1" />
                    <button
                        className={cn(
                            "flex flex-col items-center px-2 py-0.5 border border-transparent hover:border-[#808080] hover:bg-white/30 rounded-sm",
                            isSearchOpen && "border-[#808080] bg-white/50"
                        )}
                        onClick={handleSearch}
                    >
                        <Search className="w-4 h-4 text-[#3366CC]" />
                        <span className="text-[10px] text-black">Search</span>
                    </button>
                    <button
                        className="flex flex-col items-center px-2 py-0.5 border border-transparent hover:border-[#808080] hover:bg-white/30 rounded-sm"
                        onClick={handlePrint}
                    >
                        <Printer className="w-4 h-4 text-[#3366CC]" />
                        <span className="text-[10px] text-black">Print</span>
                    </button>
                </div>

                {/* Address Bar Row */}
                <div className="flex items-center gap-1 px-1 py-1 bg-[#ECE9D8] border-t border-[#808080]/20">
                    <span className="text-[11px] text-[#444] px-1">Address</span>
                    <div className="flex-1 bg-white border border-[#808080] h-[20px] flex items-center px-1">
                        <Image src="/windows/browser.png" width={14} height={14} className="mr-1 crisp-edges" alt="" />
                        <input
                            type="text"
                            value={inputUrl}
                            onChange={(e) => setInputUrl(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="w-full text-[11px] outline-none text-black bg-white"
                        />
                    </div>
                    <button
                        onClick={handleGo}
                        className="px-2 h-[20px] flex items-center bg-[#ECE9D8] border border-[#808080] hover:bg-[#DDD] text-[11px] text-black shrink-0"
                    >
                        Go
                    </button>
                </div >
            </div >

            {/* Search Bar (Companion Panel Style) */}
            {
                isSearchOpen && (
                    <div className="absolute top-[72px] left-0 w-[240px] bottom-0 bg-[#ECE9D8] border-r border-[#ACA899] p-4 z-40 shadow-xl no-print">
                        <div className="flex justify-between items-center mb-4 border-b border-[#ACA899] pb-2">
                            <h3 className="text-xs font-bold flex items-center gap-2">
                                <Search className="w-4 h-4 text-[#3366CC]" />
                                Search Assistant
                            </h3>
                            <button onClick={() => setIsSearchOpen(false)} className="text-[#808080] hover:text-black">×</button>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold">Search within page:</label>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-white border border-[#7F9DB9] px-2 py-1 text-xs outline-none focus:border-[#316AC5]"
                                    placeholder="Exact match / contains..."
                                    autoFocus
                                />
                            </div>

                            <div className="bg-[#FFFFE1] border border-[#E6DB55] p-3 text-[10px] space-y-2">
                                <p className="font-bold border-b border-[#E6DB55] pb-1">Quick Tip:</p>
                                <p className="leading-relaxed">
                                    Use the Search Companion to find specific items in the current subject or quiz.
                                </p>
                            </div>

                            <button
                                className="w-full bg-[#F0F0F0] border-2 border-outset border-[#DED9C1] py-1 text-xs hover:bg-[#E2E2E2] active:border-inset"
                                onClick={() => alert(`Searching for: ${searchQuery}`)}
                            >
                                Search
                            </button>
                        </div>
                    </div>
                )
            }

            {/* Browser Content */}
            <div className={cn(
                "flex-1 bg-white border-2 border-inset border-[#808080] overflow-auto text-black print:border-none print:m-0",
                isSearchOpen && "ml-[240px]"
            )}>
                {view === 'quiz' && quiz && subjectId ? (
                    <XPQuiz quiz={quiz} subjectId={subjectId} />
                ) : view === 'admin' ? (
                    <AdminTool />
                ) : view === 'mistakes' ? (
                    <div className="bg-white min-h-full p-12 max-w-4xl mx-auto shadow-[0_0_20px_rgba(0,0,0,0.1)] my-8">
                        <div className="border-b-2 border-black pb-8 mb-8 text-center">
                            <h1 className="text-3xl font-serif font-bold uppercase tracking-widest">Mistakes Report</h1>
                            <p className="text-sm mt-2 text-gray-600">Subject ID: {subjectId}</p>
                        </div>

                        {loading ? (
                            <div className="text-center py-20 italic">Generating document...</div>
                        ) : mistakesData ? (
                            <div className="space-y-12">
                                {mistakesData.quizzes
                                    .filter(q => !quiz || q.quizId === quiz.id)
                                    .map((q) => (
                                        <div key={q.quizId} className="space-y-6">
                                            <h2 className="text-xl font-bold border-l-4 border-black pl-4">
                                                {q.quizTitle}
                                            </h2>
                                            <div className="space-y-8">
                                                {q.questions.map((mistake, index) => (
                                                    <div key={index} className="space-y-2 border-l border-gray-200 pl-6 ml-4">
                                                        <p className="font-bold underline">Question {index + 1}:</p>
                                                        <p className="text-lg leading-relaxed">{mistake.questionText}</p>

                                                        {mistake.options ? (
                                                            <div className="space-y-2 mt-4">
                                                                {mistake.options.map((opt) => {
                                                                    const isSelected = mistake.selectedOptionIds.includes(opt.id);
                                                                    const isCorrect = mistake.correctOptionIds.includes(opt.id);

                                                                    let className = "p-2 border rounded-sm flex items-center justify-between text-sm";
                                                                    if (isCorrect) {
                                                                        className += " bg-[#E6F4EA] border-[#B8E2C3] font-bold text-green-800";
                                                                    } else if (isSelected) {
                                                                        className += " bg-[#FDECEA] border-[#F4C7C7] text-red-800";
                                                                    } else {
                                                                        className += " border-gray-200 text-gray-600";
                                                                    }

                                                                    return (
                                                                        <div key={opt.id} className={className}>
                                                                            <span>{opt.text}</span>
                                                                            {isCorrect && <span className="text-[10px] uppercase font-bold text-green-700 ml-2">Correct Answer</span>}
                                                                            {isSelected && !isCorrect && <span className="text-[10px] uppercase font-bold text-red-600 ml-2">Your Answer</span>}
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        ) : (
                                                            <div className="grid grid-cols-2 gap-8 mt-4 bg-gray-50 p-4 border border-gray-100">
                                                                <div>
                                                                    <p className="text-[10px] font-bold uppercase text-red-600">Your Answer</p>
                                                                    <p className="text-sm italic">{mistake.selectedOptionIds.join(', ') || 'No answer'}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-[10px] font-bold uppercase text-green-700">Correct Answer</p>
                                                                    <p className="text-sm font-bold">{mistake.correctOptionIds.join(', ')}</p>
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div className="mt-4 pt-4 border-t border-dotted border-gray-300">
                                                            <p className="text-[10px] font-bold uppercase text-gray-500">Explanation</p>
                                                            <p className="text-sm leading-relaxed italic text-gray-700">
                                                                {mistake.explanation}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 italic text-gray-400">
                                No record of mistakes found for this subject.
                            </div>
                        )}

                        <div className="mt-20 pt-8 border-t border-black text-[10px] flex justify-between uppercase tracking-widest">
                            <span>Syllabus System Document</span>
                            <span>{new Date().toLocaleDateString()}</span>
                        </div>
                    </div>
                ) : (
                    <WelcomeScreen />
                )}
            </div>
        </div >
    );
}
