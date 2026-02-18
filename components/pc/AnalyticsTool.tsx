'use client';

import React, { useMemo } from 'react';
import { BarChart3, TrendingDown, AlertCircle, Trophy } from 'lucide-react';
import { Subject } from '@/lib/firebase';

interface AnalyticsToolProps {
    mistakesCounts: Record<string, number>;
    subjects: Subject[];
}

export function AnalyticsTool({ mistakesCounts, subjects }: AnalyticsToolProps) {
    const stats = useMemo(() => {
        const sortedSubjects = subjects
            .map(s => ({
                name: s.name,
                count: mistakesCounts[s.id] || 0
            }))
            .sort((a, b) => b.count - a.count);

        const topMistakes = sortedSubjects.slice(0, 5).filter(s => s.count > 0);
        const totalMistakes = Object.values(mistakesCounts).reduce((a, b) => a + b, 0);

        return {
            topMistakes,
            totalMistakes,
            mostProblematic: topMistakes[0] || null
        };
    }, [mistakesCounts, subjects]);

    return (
        <div className="flex flex-col h-full bg-[#ECE9D8] text-[11px] font-tahoma overflow-auto p-4 gap-6">
            {/* Header / Summary */}
            <div className="flex gap-4 items-start">
                <div className="w-16 h-16 bg-white border border-[#ACA899] flex items-center justify-center shadow-[inset_1px_1px_2px_rgba(0,0,0,0.1)]">
                    <BarChart3 className="w-10 h-10 text-[#003399]" />
                </div>
                <div className="flex flex-col gap-1">
                    <h2 className="text-sm font-bold text-[#003399]">Study Performance Analytics</h2>
                    <p className="text-[#444]">Detailed analysis of your learning patterns and areas for improvement.</p>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#FFFFE1] border border-[#ACA899] p-3 shadow-sm flex items-center gap-3">
                    <AlertCircle className="w-6 h-6 text-[#D32F2F]" />
                    <div>
                        <div className="font-bold">Total Mistakes</div>
                        <div className="text-lg">{stats.totalMistakes}</div>
                    </div>
                </div>
                <div className="bg-white border border-[#ACA899] p-3 shadow-sm flex items-center gap-3">
                    <TrendingDown className="w-6 h-6 text-[#1976D2]" />
                    <div>
                        <div className="font-bold">Critical Subject</div>
                        <div className="text-[10px] truncate max-w-[100px]">{stats.mostProblematic?.name || 'None'}</div>
                    </div>
                </div>
            </div>

            {/* Top Mistakes Bar Chart (Classic XP style) */}
            <div className="flex flex-col gap-2">
                <div className="font-bold text-[#444] border-b border-[#ACA899] pb-1 flex items-center gap-2">
                    <BarChart3 className="w-3 h-3 text-[#003399]" />
                    Top Problematic Subjects
                </div>

                {stats.topMistakes.length > 0 ? (
                    <div className="flex flex-col gap-3 mt-2">
                        {stats.topMistakes.map((s) => (
                            <div key={s.name} className="flex flex-col gap-1">
                                <div className="flex justify-between px-1">
                                    <span>{s.name}</span>
                                    <span className="font-bold">{s.count} mistakes</span>
                                </div>
                                <div className="h-4 bg-white border border-[#ACA899] shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] overflow-hidden relative">
                                    <div
                                        className="h-full bg-linear-to-b from-[#2F71CD] to-[#1A52B3] border-r border-[#1941A5]"
                                        style={{ width: `${Math.min(100, (s.count / stats.topMistakes[0].count) * 100)}%` }}
                                    >
                                        <div className="w-full h-1/2 bg-white/10" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white/50 p-8 text-center text-[#888] italic border border-dashed border-[#ACA899]">
                        No mistakes recorded yet. Keep up the good work!
                    </div>
                )}
            </div>

            {/* Recommendations Section */}
            <div className="bg-[#FFFFE1] border border-[#E6DB55] p-3 rounded-xs text-[10px] leading-relaxed relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-1 opacity-20"><Trophy className="w-8 h-8 rotate-12" /></div>
                <div className="font-bold flex items-center gap-1 mb-1 text-[#665e10]">
                    <Trophy className="w-3 h-3" />
                    Study Tip:
                </div>
                {stats.mostProblematic ? (
                    <p>Focus on <b>{stats.mostProblematic.name}</b> in your next session. Reviewing your specific mistakes in the Mistakes folder is 4x more effective than re-reading notes.</p>
                ) : (
                    <p>Continue following your syllabus. Consistency is the key to long-term retention.</p>
                )}
            </div>
        </div>
    );
}
