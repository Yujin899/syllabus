import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

type SymbianHomeProps = {
    onOpenApp: (appId: 'my-files' | 'browser' | 'about' | 'analytics') => void;
    positions: Record<string, { x: number; y: number }>;
    onPositionUpdate: React.Dispatch<React.SetStateAction<Record<string, { x: number; y: number }>>>;
};

export function SymbianHome({ onOpenApp, positions, onPositionUpdate }: SymbianHomeProps) {
    const [selectedIndex, setSelectedIndex] = React.useState(-1);
    const [draggingId, setDraggingId] = React.useState<string | null>(null);
    const dragStart = React.useRef({ x: 0, y: 0 });

    const apps = [
        { id: 'my-files', label: 'My Files', icon: '/symbian/folder.png' },
        { id: 'browser', label: 'Browser', icon: '/symbian/browser.png' },
        { id: 'about', label: 'About', icon: '/symbian/about.png' },
        { id: 'analytics', label: 'Analytics', icon: '/symbian/analytics.png' },
    ];

    const handleMouseDown = (e: React.MouseEvent | React.TouchEvent, id: string) => {
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

        setDraggingId(id);
        const currentPos = positions[id] || { x: 0, y: 0 };
        dragStart.current = {
            x: clientX - currentPos.x,
            y: clientY - currentPos.y
        };
    };

    React.useEffect(() => {
        if (!draggingId) return;

        const handleMove = (e: MouseEvent | TouchEvent) => {
            const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
            const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

            onPositionUpdate(prev => ({
                ...prev,
                [draggingId]: {
                    x: clientX - dragStart.current.x,
                    y: clientY - dragStart.current.y
                }
            }));
        };

        const handleEnd = () => {
            setDraggingId(null);
        };

        window.addEventListener('mousemove', handleMove);
        window.addEventListener('mouseup', handleEnd);
        window.addEventListener('touchmove', handleMove);
        window.addEventListener('touchend', handleEnd);

        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleEnd);
            window.removeEventListener('touchmove', handleMove);
            window.removeEventListener('touchend', handleEnd);
        };
    }, [draggingId, onPositionUpdate]);

    return (
        <div className="flex-1 bg-linear-to-b from-[#3a5a78] to-[#000000] p-4 relative overflow-hidden">
            <div className="grid grid-cols-3 gap-6 mt-4">
                {apps.map((app, index) => {
                    const pos = positions[app.id] || { x: 0, y: 0 };
                    return (
                        <div
                            key={app.id}
                            onMouseDown={(e) => handleMouseDown(e, app.id)}
                            onTouchStart={(e) => handleMouseDown(e, app.id)}
                            onClick={() => {
                                if (pos.x === 0 && pos.y === 0) { // Only open if not dragged? Or just open.
                                    setSelectedIndex(index);
                                    onOpenApp(app.id as 'my-files' | 'browser' | 'about');
                                }
                            }}
                            style={{
                                transform: `translate(${pos.x}px, ${pos.y}px)`,
                                zIndex: draggingId === app.id ? 50 : 1,
                                transition: draggingId === app.id ? 'none' : 'transform 0.2s ease-out'
                            }}
                            className={cn(
                                "flex flex-col items-center gap-1 p-2 rounded-sm cursor-default select-none touch-none",
                                selectedIndex === index ? "bg-white/20 ring-1 ring-white/50" : "hover:bg-white/10"
                            )}
                        >
                            <div className="w-14 h-14 relative pointer-events-none flex items-center justify-center">
                                <Image
                                    src={app.icon}
                                    alt={app.label}
                                    width={56}
                                    height={56}
                                    className="drop-shadow-md"
                                    priority={index === 0}
                                />
                            </div>
                            <span className="text-white text-[11px] font-medium drop-shadow-sm text-center leading-tight pointer-events-none">
                                {app.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
