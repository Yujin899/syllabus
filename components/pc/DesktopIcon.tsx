'use client';

import React, { useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface DesktopIconProps {
    id: string;
    label: string;
    icon: React.ReactNode;
    selected?: boolean;
    onSelect: (id: string) => void;
    onOpen: (id: string) => void;
}

export function DesktopIcon({ id, label, icon, selected, onSelect, onOpen }: DesktopIconProps) {
    const [clickCount, setClickCount] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

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
            onClick={handleClick}
            className={cn(
                "w-[75px] h-[75px] flex flex-col items-center justify-start cursor-default select-none",
                "m-2" // Base margin for grid spacing
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
