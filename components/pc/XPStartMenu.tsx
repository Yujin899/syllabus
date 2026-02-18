'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { LogOut } from 'lucide-react';
import Image from 'next/image';

interface XPStartMenuProps {
    onOpenWindow: (type: 'subjects' | 'quizzes' | 'about' | 'browser') => void;
    onClose: () => void;
}

export function XPStartMenu({ onOpenWindow, onClose }: XPStartMenuProps) {
    const { profile, logout } = useAuth();

    const handleItemClick = (type: 'subjects' | 'quizzes' | 'about' | 'browser') => {
        onOpenWindow(type);
        onClose();
    };

    const handleLogout = () => {
        logout();
        onClose();
    };

    return (
        <div className="absolute bottom-[30px] left-0 w-[380px] bg-[#245ED1] border-2 border-[#002EAD] rounded-t-lg shadow-[2px_2px_10px_rgba(0,0,0,0.5)] flex flex-col z-50 overflow-hidden select-none">
            {/* Header */}
            <div className="h-[60px] bg-linear-to-r from-[#1D5AD0] to-[#4282D6] p-2 flex items-center gap-3 border-b border-[#002EAD]/30">
                <div className="w-10 h-10 bg-white p-0.5 rounded-sm shadow-[1px_1px_2px_rgba(0,0,0,0.5)]">
                    <div className="w-full h-full bg-[#FF8E29] flex items-center justify-center">
                        <span className="text-white font-bold text-xl drop-shadow-[1px_1px_0px_black]">
                            {profile?.email?.[0].toUpperCase() || 'U'}
                        </span>
                    </div>
                </div>
                <span className="text-white font-bold text-sm drop-shadow-[1px_1px_1px_black]">
                    {profile?.email?.split('@')[0] || 'User'}
                </span>
            </div>

            {/* Menu Content */}
            <div className="flex bg-white h-[300px]">
                {/* Left Column */}
                <div className="flex-1 flex flex-col p-1.5 gap-1 bg-white">
                    <button
                        onClick={() => handleItemClick('browser')}
                        className="flex items-center gap-2 p-1.5 hover:bg-[#2F71CD] hover:text-white rounded-xs group text-left"
                    >
                        <Image src="/windows/browser.png" width={32} height={32} className="crisp-edges" alt="" />
                        <div className="flex flex-col">
                            <span className="text-[11px] font-bold text-black">Syllabus Browser</span>
                            <span className="text-[9px] text-[#444] group-hover:text-white/80">Browse intranet content</span>
                        </div>
                    </button>
                    <button
                        onClick={() => handleItemClick('subjects')}
                        className="flex items-center gap-2 p-1.5 hover:bg-[#2F71CD] hover:text-white rounded-xs group text-left"
                    >
                        <Image src="/windows/folder.png" width={32} height={32} className="crisp-edges" alt="" />
                        <div className="flex flex-col">
                            <span className="text-[11px] font-bold text-black">Subjects</span>
                            <span className="text-[9px] text-[#444] group-hover:text-white/80">View your learning modules</span>
                        </div>
                    </button>

                    <div className="mt-auto border-t border-[#CCC] pt-1" />

                    <div className="p-2 text-[9px] text-[#808080] italic">
                        All Programs &gt;
                    </div>
                </div>

                {/* Right Column */}
                <div className="w-[160px] bg-[#D3E5FA] border-l border-[#95B7E8] p-1.5 flex flex-col gap-0.5">
                    <button
                        onClick={() => handleItemClick('about')}
                        className="flex items-center gap-2 p-1.5 hover:bg-[#2F71CD] hover:text-white rounded-xs group text-left"
                    >
                        <Image src="/windows/about.png" width={20} height={20} className="crisp-edges" alt="" />
                        <span className="text-[11px] font-bold text-[#003399] group-hover:text-white">About</span>
                    </button>
                </div>
            </div>

            {/* Footer */}
            <div className="h-[35px] bg-linear-to-r from-[#1D5AD0] to-[#4282D6] p-1 flex justify-end gap-1 items-center border-t border-[#002EAD]/30">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 px-3 py-1 hover:brightness-110 active:brightness-90 rounded-sm"
                >
                    <div className="bg-[#FF8E29] p-1 rounded-xs shadow-[1px_1px_1px_black]">
                        <LogOut className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-white text-[11px] font-bold drop-shadow-[1px_1px_0px_black]">Log Off</span>
                </button>
                <div className="w-5" />
            </div>
        </div>
    );
}
