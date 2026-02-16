'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface MenuItem {
    id: string;
    label: string;
    icon?: React.ReactNode;
}

interface SymbianMenuProps {
    items: MenuItem[];
    selectedIndex: number;
    onSelect: (index: number) => void;
    onConfirm: (id: string) => void;
}

export function SymbianMenu({ items, selectedIndex, onSelect, onConfirm }: SymbianMenuProps) {
    return (
        <div className="symbian-ui flex-1 flex flex-col bg-(--symbian-bg) overflow-y-auto">
            <div className="flex flex-col">
                {items.map((item, index) => (
                    <button
                        key={item.id}
                        onClick={() => {
                            onSelect(index);
                            onConfirm(item.id);
                        }}
                        className={cn(
                            "h-14 px-3 flex items-center gap-3 border-b border-(--symbian-border) w-full text-left",
                            index === selectedIndex ? "bg-(--symbian-row-highlight)" : "bg-(--symbian-row-bg)"
                        )}
                    >
                        {item.icon && (
                            <div className="w-8 h-8 flex items-center justify-center text-white p-1 shrink-0">
                                {item.icon}
                            </div>
                        )}
                        <span className={cn(
                            "text-base font-normal",
                            index === selectedIndex ? "text-white" : "text-(--symbian-text)"
                        )}>
                            {item.label}
                        </span>
                        {index === selectedIndex && (
                            <div className="ml-auto w-1 h-3 bg-white/20" />
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}
