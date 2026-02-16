import React from 'react';
import { ArrowLeft, RefreshCw, X } from 'lucide-react';

type SymbianBrowserProps = {
    url: string;
    children?: React.ReactNode;
    loading?: boolean;
    onBack?: () => void;
    onNavigate?: (url: string) => void;
};

export function SymbianBrowser({ url, children, loading, onBack, onNavigate }: SymbianBrowserProps) {
    const [inputUrl, setInputUrl] = React.useState(url);

    React.useEffect(() => {
        setInputUrl(url);
    }, [url]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && onNavigate) {
            onNavigate(inputUrl);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#121212] text-white">
            {/* Browser Address Bar - Dark Mode */}
            <div className="h-10 bg-[#1E1E1E] border-b border-[#333] flex items-center px-2 gap-2 shadow-sm shrink-0">
                <button onClick={onBack} className="p-1 hover:bg-[#333] rounded-sm active:bg-[#444]">
                    <ArrowLeft className="w-4 h-4 text-[#AAA]" />
                </button>
                <div className="flex-1 bg-[#2A2A2A] border border-[#333] h-7 rounded-sm flex items-center px-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mr-2 opacity-70 shrink-0"></div>
                    <input
                        type="text"
                        value={inputUrl}
                        onChange={(e) => setInputUrl(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="bg-transparent border-none outline-none text-xs text-[#DDD] w-full font-sans ml-1"
                        placeholder="Enter URL..."
                    />
                </div>
                <button
                    onClick={() => onNavigate?.(inputUrl)}
                    className="p-1 hover:bg-[#333] rounded-sm active:bg-[#444]"
                >
                    {loading ? <X className="w-4 h-4 text-[#AAA]" /> : <RefreshCw className="w-4 h-4 text-[#AAA]" />}
                </button>
            </div>

            {/* Browser Content */}
            <div className="flex-1 overflow-auto relative font-serif bg-[#121212] text-[#EEE]">
                {children}
            </div>

            {/* Browser Status Bar - Dark Mode */}
            <div className="h-5 bg-[#1E1E1E] border-t border-[#333] flex items-center justify-between px-2 text-[10px] text-[#888] shrink-0 font-sans">
                <span>Done</span>
                <span>100%</span>
            </div>
        </div>
    );
}
