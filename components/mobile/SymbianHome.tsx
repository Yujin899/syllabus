import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

type SymbianHomeProps = {
    onOpenApp: (appId: 'my-files' | 'browser' | 'about') => void;
};

export function SymbianHome({ onOpenApp }: SymbianHomeProps) {
    const [selectedIndex, setSelectedIndex] = React.useState(-1);

    const apps = [
        { id: 'my-files', label: 'My Files', icon: '/symbian/folder.png' },
        { id: 'browser', label: 'Browser', icon: '/symbian/browser.png' },
        { id: 'about', label: 'About', icon: '/symbian/about.png' },
    ];

    return (
        <div className="flex-1 bg-linear-to-b from-[#3a5a78] to-[#000000] p-4">
            <div className="grid grid-cols-3 gap-6 mt-4">
                {apps.map((app, index) => (
                    <div
                        key={app.id}
                        onClick={() => {
                            setSelectedIndex(index);
                            onOpenApp(app.id as 'my-files' | 'browser' | 'about');
                        }}
                        className={cn(
                            "flex flex-col items-center gap-1 p-2 rounded-sm",
                            selectedIndex === index ? "bg-white/20 ring-1 ring-white/50" : "hover:bg-white/10"
                        )}
                    >
                        <div className="w-14 h-14 relative">
                            <Image
                                src={app.icon}
                                alt={app.label}
                                width={56}
                                height={56}
                                className="drop-shadow-md"
                            />
                        </div>
                        <span className="text-white text-[11px] font-medium drop-shadow-sm text-center leading-tight">
                            {app.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
