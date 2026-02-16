'use client';

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { X, Minus, Square, Copy } from 'lucide-react';
import Image from 'next/image';

interface XPWindowProps {
    title: string;
    onClose: () => void;
    children: React.ReactNode;
    defaultX?: number;
    defaultY?: number;
    isMaximized?: boolean;
    onMaximize?: () => void;
    onMinimize?: () => void;
    icon?: string;
    id?: string;
}

export function XPWindow({
    title,
    onClose,
    children,
    defaultX = 100,
    defaultY = 80,
    isMaximized = false,
    onMaximize,
    onMinimize,
    icon,
}: XPWindowProps) {
    const [pos, setPos] = useState({ x: defaultX, y: defaultY });
    const [isDragging, setIsDragging] = useState(false);
    const dragOffset = useRef({ x: 0, y: 0 });
    const [isInitialRender, setIsInitialRender] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsInitialRender(false), 180);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!isDragging || isMaximized) return;

        const handleMouseMove = (e: MouseEvent) => {
            setPos({
                x: e.clientX - dragOffset.current.x,
                y: e.clientY - dragOffset.current.y
            });
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, isMaximized]);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (isMaximized) return;
        setIsDragging(true);
        dragOffset.current = {
            x: e.clientX - pos.x,
            y: e.clientY - pos.y
        };
    };

    return (
        <div
            style={{
                left: isMaximized ? '0' : `${pos.x}px`,
                top: isMaximized ? '0' : `${pos.y}px`,
                width: isMaximized ? '100vw' : '500px',
                height: isMaximized ? 'calc(100vh - 30px)' : '380px',
                transform: isInitialRender ? 'scale(0.95)' : 'scale(1)',
                opacity: isInitialRender ? 0 : 1,
                borderRadius: isMaximized ? '0' : '5px 5px 0 0'
            }}
            className={cn(
                "xp-ui fixed border border-[#003399] flex flex-col bg-[#ECE9D8] pointer-events-auto select-none overflow-hidden z-40",
                "transition-[transform,opacity] duration-150 ease-out shadow-[2px_2px_10px_rgba(0,0,0,0.3)]"
            )}
        >
            {/* XP Title Bar (Official Luna Blue) - DRAGGABLE AREA */}
            <div
                onMouseDown={handleMouseDown}
                onDoubleClick={onMaximize}
                className="h-[28px] bg-linear-to-b from-[#0055EE] to-[#0033BB] flex items-center justify-between px-1 border-b border-[#003399] shrink-0 cursor-default active:brightness-110"
            >
                <div className="flex items-center gap-2 overflow-hidden px-1">
                    <Image
                        src={icon || "/windows/folder.png"}
                        alt=""
                        width={16}
                        height={16}
                        className="shrink-0 crisp-edges"
                        draggable={false}
                    />
                    <span className="text-white text-[11px] font-bold whitespace-nowrap overflow-hidden text-ellipsis drop-shadow-[1px_1px_0px_rgba(0,0,0,0.8)]">
                        {title}
                    </span>
                </div>

                {/* Window Controls */}
                <div className="flex items-center gap-0.5 px-0.5">
                    {/* Minimize */}
                    <button
                        onClick={(e) => { e.stopPropagation(); onMinimize?.(); }}
                        className="w-[21px] h-[21px] bg-[#3B7BDD] border border-[#1941A5] rounded-[2px] flex items-center justify-center hover:brightness-110 active:brightness-90 shadow-[inset_-1px_-1px_1px_rgba(0,0,0,0.3),inset_1px_1px_1px_rgba(255,255,255,0.2)]"
                    >
                        <Minus className="w-3.5 h-3.5 text-white" strokeWidth={4} />
                    </button>

                    {/* Maximize / Restore */}
                    <button
                        onClick={(e) => { e.stopPropagation(); onMaximize?.(); }}
                        className="w-[21px] h-[21px] bg-[#3B7BDD] border border-[#1941A5] rounded-[2px] flex items-center justify-center hover:brightness-110 active:brightness-90 shadow-[inset_-1px_-1px_1px_rgba(0,0,0,0.3),inset_1px_1px_1px_rgba(255,255,255,0.2)]"
                    >
                        {isMaximized ? (
                            <Copy className="w-3.5 h-3.5 text-white rotate-180" strokeWidth={3} />
                        ) : (
                            <Square className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                        )}
                    </button>

                    {/* Close Button */}
                    <button
                        onClick={(e) => { e.stopPropagation(); onClose(); }}
                        className="w-[21px] h-[21px] bg-[#EE4433] border border-[#771100] rounded-[2px] flex items-center justify-center hover:brightness-110 active:brightness-90 shadow-[inset_-1px_-1px_1px_rgba(0,0,0,0.5),inset_1px_1px_1px_rgba(255,255,255,0.3)] ml-0.5"
                    >
                        <X className="w-4 h-4 text-white" strokeWidth={4} />
                    </button>
                </div>
            </div>

            {/* Menu Bar */}
            <div className="h-[22px] bg-[#ECE9D8] border-b border-white flex items-center px-1 gap-4 text-[11px] text-black shrink-0">
                <span className="hover:bg-[#316AC5] hover:text-white px-1">File</span>
                <span className="hover:bg-[#316AC5] hover:text-white px-1">Edit</span>
                <span className="hover:bg-[#316AC5] hover:text-white px-1">View</span>
                <span className="hover:bg-[#316AC5] hover:text-white px-1">Favorites</span>
                <span className="hover:bg-[#316AC5] hover:text-white px-1">Tools</span>
                <span className="hover:bg-[#316AC5] hover:text-white px-1">Help</span>
            </div>

            {/* Window Content */}
            <div className="flex-1 overflow-auto bg-white border-2 border-inset border-[#808080] m-1 cursor-default text-black font-normal">
                {children}
            </div>

            {/* Status Bar */}
            <div className="h-[22px] bg-[#ECE9D8] border-t border-white flex items-center px-1 text-[11px] text-[#444] shrink-0">
                <div className="flex-1 border-r border-[#ACA899] h-full flex items-center px-1 leading-none shadow-[inset_-1px_0px_0px_white]">
                    Done
                </div>
                <div className="w-[120px] h-full flex items-center px-2 leading-none">
                    My Computer
                </div>
            </div>
        </div>
    );
}
