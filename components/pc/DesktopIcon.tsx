'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface DesktopIconProps {
    id: string;
    label: string;
    icon: React.ReactNode;
    selected?: boolean;
    onSelect: (id: string) => void;
    onOpen: (id: string) => void;
    pos?: { x: number; y: number };
    onPositionUpdate?: (id: string, x: number, y: number) => void;
}

export function DesktopIcon({ id, label, icon, selected, onSelect, onOpen, pos = { x: 0, y: 0 }, onPositionUpdate }: DesktopIconProps) {
    const [clickCount, setClickCount] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const dragStart = useRef({ x: 0, y: 0 });

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        dragStart.current = {
            x: e.clientX - pos.x,
            y: e.clientY - pos.y
        };
    };

    useEffect(() => {
        if (!isDragging) return;

        const handleMouseMove = (e: MouseEvent) => {
            onPositionUpdate?.(id, e.clientX - dragStart.current.x, e.clientY - dragStart.current.y);
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
    }, [isDragging, id, onPositionUpdate]);

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onSelect(id);

        if (clickCount === 0) {
            setClickCount(1);
            timerRef.current = setTimeout(() => {
                setClickCount(0);
                timerRef.current = null;
            }, 500);
        } else {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }
            setClickCount(0);
            onOpen(id);
        }
    };

    return (
        <div
            onMouseDown={handleMouseDown}
            onClick={handleClick}
            style={{
                transform: `translate(${pos.x}px, ${pos.y}px)`,
                zIndex: isDragging ? 50 : 1
            }}
            className={cn(
                "w-[75px] h-[75px] flex flex-col items-center justify-start cursor-default select-none transition-transform duration-0",
                "m-2 relative" // Base margin for grid spacing
            )}
        >
            {/* 32x32 Icon Container */}
            <div className={cn(
                "w-8 h-8 flex items-center justify-center relative mb-1",
                selected ? "after:absolute after:inset-0 after:bg-[#0A5FEE]/30 after:border after:border-[#0A5FEE]/50" : ""
            )}>
                <div className="w-8 h-8 flex items-center justify-center shrink-0">
                    {icon ? icon : (
                        <Image
                            src="/windows/folder.png"
                            alt=""
                            width={32}
                            height={32}
                            className="crisp-edges"
                            style={{ width: 'auto', height: 'auto' }}
                            draggable={false}
                        />
                    )}
                </div>
            </div>

            {/* Labels: Tahoma, 11px, 1px Shadow */}
            <div className={cn(
                "xp-desktop-icon-label px-0.5 max-w-full break-words line-clamp-2",
                selected ? "bg-[#0A5FEE] text-shadow-none" : ""
            )}>
                {label}
            </div>
        </div>
    );
}
