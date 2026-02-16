import React from 'react';
import { Globe, AlertTriangle, Smile } from 'lucide-react';

export function SymbianWelcome() {
    return (
        <div className="flex flex-col items-center justify-center min-h-full p-6 text-center bg-[#121212] text-[#CCC] font-sans">
            <div className="mb-6 relative">
                <Globe className="w-20 h-20 text-[#0055AA] animate-pulse opacity-80" />
                <Smile className="w-8 h-8 text-[#FFCC00] absolute -bottom-2 -right-2 rotate-12 bg-[#121212] rounded-full" />
            </div>

            <h1 className="text-xl font-bold text-white mb-2 tracking-wide">
                The Inter-Net
            </h1>

            <div className="bg-[#222] border border-[#333] p-4 rounded-sm shadow-inner w-full max-w-[280px] mb-6">
                <p className="text-xs leading-relaxed text-[#AAA] font-mono">
                    &quot;Connecting people... eventually.&quot;
                </p>
                <div className="h-px bg-[#333] my-2" />
                <p className="text-[10px] text-[#666]">
                    Best viewed with 240x320 resolution.
                    <br />
                    No cookies were harmed.
                </p>
            </div>

            <div className="flex flex-col gap-2 w-full max-w-[200px] text-[10px]">
                <div className="flex items-center gap-2 text-[#FF4444] bg-[#330000] p-2 rounded-sm border border-[#550000]">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Don&apos;t feed the trolls.</span>
                </div>
            </div>

            <div className="mt-8 text-[9px] text-[#444] animate-bounce">
                ▼ Scroll for nothing ▼
            </div>
        </div>
    );
}
