'use client';

import React, { useMemo } from 'react';
import { BarChart3, AlertCircle, Trophy, ChevronRight } from 'lucide-react';
import { Subject } from '@/lib/firebase';
import { cn } from '@/lib/utils';

interface SymbianAnalyticsProps {
    mistakesCounts: Record<string, number>;
    subjects: Subject[];
}

export function SymbianAnalytics({ mistakesCounts, subjects }: SymbianAnalyticsProps) {
    const stats = useMemo(() => {
        const sortedSubjects = subjects
            .map(s => ({
                name: s.name,
                count: mistakesCounts[s.id] || 0
            }))
            .sort((a, b) => b.count - a.count)
            .filter(s => s.count > 0);

        const totalMistakes = Object.values(mistakesCounts).reduce((a, b) => a + b, 0);

        return {
            sortedSubjects,
            totalMistakes
        };
    }, [mistakesCounts, subjects]);

    return (
        <div className="flex-1 bg-black flex flex-col overflow-hidden text-white">
            {/* Symbian style header */}
            <div className="bg-[#2a4a68] text-white px-3 py-2 flex justify-between items-center shrink-0 shadow-lg border-b border-white/10">
                <span className="text-[14px] font-bold tracking-wide">Analytics</span>
                <BarChart3 className="w-4 h-4 opacity-70" />
            </div>

            {/* Content List */}
            <div className="flex-1 overflow-y-auto bg-black">
                {/* Summary Card */}
                <div className="m-3 bg-[#1a1a1a] border border-[#333] p-3 rounded-xs shadow-md flex items-center justify-between">
                    <div>
                        <div className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Total Mistakes</div>
                        <div className="text-2xl font-bold text-[#4a89c7]">{stats.totalMistakes}</div>
                    </div>
                    <AlertCircle className="w-8 h-8 text-[#ff4444] opacity-40" />
                </div>

                <div className="px-3 py-1 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    Subject Breakdown
                </div>

                <div className="bg-[#111] border-t border-b border-[#333] divide-y divide-[#222]">
                    {stats.sortedSubjects.length > 0 ? (
                        stats.sortedSubjects.map((s, i) => (
                            <div key={s.name} className="flex p-3 items-center gap-3 active:bg-[#222] transition-colors">
                                <div className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-sm shadow-inner",
                                    i === 0 ? "bg-[#d32f2f]" : i === 1 ? "bg-[#f57c00]" : "bg-[#1976d2]"
                                )}>
                                    {s.count}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-[13px] font-bold text-gray-100 truncate">{s.name}</div>
                                    <div className="h-1.5 bg-[#222] rounded-full mt-1 overflow-hidden">
                                        <div
                                            className="h-full bg-[#4a89c7]/60"
                                            style={{ width: `${Math.min(100, (s.count / stats.sortedSubjects[0].count) * 100)}%` }}
                                        />
                                    </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-600" />
                            </div>
                        ))
                    ) : (
                        <div className="p-10 text-center text-gray-600 italic text-[12px]">
                            No analytics data available yet.
                        </div>
                    )}
                </div>

                {/* Tip Section */}
                <div className="m-3 bg-[#0d1b2a] border border-[#1b3a5a] p-3 rounded-xs flex gap-3 items-start">
                    <Trophy className="w-5 h-5 text-[#4a89c7] shrink-0" />
                    <div>
                        <div className="text-[12px] font-bold text-[#4a89c7]">Smart Tip</div>
                        <p className="text-[11px] text-[#7a9ab8] leading-tight mt-1">
                            Reviewing your mistakes daily increases retention by up to 40%. Try doing a &quot;Mistake Run&quot; before starting a new topic.
                        </p>
                    </div>
                </div>
            </div>

            {/* Symbian Bottom Bar */}
            <div className="h-10 bg-[#111] border-t border-[#333] flex items-center justify-between px-4 shrink-0 shadow-[0_-2px_10px_rgba(0,0,0,0.5)]">
                <span className="text-[11px] font-bold text-[#4a89c7] active:text-white cursor-pointer">Options</span>
                <span className="text-[11px] font-bold text-[#4a89c7] active:text-white cursor-pointer">Back</span>
            </div>
        </div>
    );
}
