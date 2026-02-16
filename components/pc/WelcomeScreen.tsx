'use client';

import React from 'react';

export function WelcomeScreen() {
    return (
        <div className="p-8">
            <div className="max-w-2xl mx-auto space-y-6">
                <header className="border-b-2 border-[#003399] pb-4">
                    <h1 className="text-3xl font-serif text-[#003399]">Welcome to Syllabus Browser</h1>
                    <p className="text-sm text-gray-600 mt-2 italic">A secure gateway to knowledge. Version 1.0.4.881</p>
                </header>

                <section className="space-y-4">
                    <h2 className="text-xl font-bold border-l-4 border-[#003399] pl-4">System Overview</h2>
                    <p className="leading-relaxed">
                        You are currently viewing the local intranet interface of the Syllabus Learning Management System.
                        This portal provides access to all your subjects, quizzes, and personal learning metrics in a strictly controlled OS-metaphor environment.
                    </p>
                </section>

                <div className="bg-[#FFFFE1] border border-[#E6DB55] p-4 text-sm shadow-sm flex gap-4">
                    <div className="w-12 h-12 bg-[#003399]/10 rounded-full flex items-center justify-center shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-[#003399]">
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="M12 16v-4"></path>
                            <path d="M12 8h.01"></path>
                        </svg>
                    </div>
                    <p className="italic">
                        <strong>Note:</strong> Pop-ups are currently minimized to ensure focus.
                        Please use the system windows to navigate through your educational content.
                    </p>
                </div>

                <footer className="pt-8 text-xs text-gray-500 text-center">
                    © 2006 Syllabus Corporation. All rights reserved.
                </footer>
            </div>
        </div>
    );
}
