import { XPButton } from './XPButton';

interface XPLoginCardProps {
    type: 'login' | 'register';
    isLoading?: boolean;
    onSubmit: (email: string, pass: string) => void;
    onToggle: () => void;
}

export function XPLoginCard({ type, isLoading, onSubmit, onToggle }: XPLoginCardProps) {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        let email = formData.get('email') as string;
        const pass = formData.get('password') as string;

        // Auto-transform username to email if no domain provided
        if (email && !email.includes('@')) {
            email = `${email.toLowerCase().trim()}@syllabus.os`;
        }

        onSubmit(email, pass);
    };

    return (
        <div className="xp-ui w-[360px] border-[3px] border-[#003399] rounded-t-[5px] shadow-[3px_3px_0px_rgba(0,0,0,0.2)] bg-[#ECE9D8] overflow-hidden">
            {/* Title Bar */}
            <div className="flex items-center justify-between px-1 bg-linear-to-r from-[#0055EE] via-[#0872FB] to-[#0055EE] h-[24px]">
                <div className="flex items-center gap-1 pl-1">
                    <div className="w-3.5 h-3.5 bg-white/20 border border-white/20 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-white/40" />
                    </div>
                    <span className="text-white text-[11px] font-bold tracking-tight drop-shadow-[1px_1px_0px_rgba(0,0,0,0.5)]">
                        {type === 'login' ? 'Log On to Windows' : 'Create New Account'}
                    </span>
                </div>
                <div className="flex gap-px pr-px scale-90 origin-right">
                    <button className="w-4 h-4 bg-[#0055EE] border border-white/40 flex items-center justify-center text-white text-[10px] font-bold">_</button>
                    <button className="w-4 h-4 bg-linear-to-b from-[#E31E00] to-[#A01000] border border-white/60 flex items-center justify-center text-white text-[10px] font-bold">✕</button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="p-2 border-t border-white/40">
                <div className="flex items-start gap-3">
                    {/* User Icon: Chunky, Aliased look */}
                    <div className="w-14 h-14 border-2 border-[#808080] bg-white p-px shrink-0">
                        <div className="w-full h-full border border-white bg-linear-to-br from-[#A0C0F0] to-[#5080C0] flex items-center justify-center">
                            <div className="w-6 h-6 border-2 border-white/10 rounded-full bg-white/10" />
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="flex-1 space-y-2">
                        <div className="space-y-0.5">
                            <label className="text-[10px] font-bold text-[#444] block">User name:</label>
                            <input
                                name="email"
                                type="text"
                                required
                                autoComplete="off"
                                placeholder="kareem"
                                disabled={isLoading}
                                className="w-full h-[20px] px-1 bg-white border-2 border-[#7F9DB9] text-[11px] text-[#444] outline-none xp-border-inset placeholder:text-gray-400 placeholder:opacity-100 disabled:bg-[#ddd]"
                            />
                        </div>
                        <div className="space-y-0.5">
                            <label className="text-[10px] font-bold text-[#444] block">Password:</label>
                            <input
                                name="password"
                                type="password"
                                required
                                placeholder="....."
                                disabled={isLoading}
                                className="w-full h-[20px] px-1 bg-white border-2 border-[#7F9DB9] text-[11px] text-[#444] outline-none xp-border-inset placeholder:text-gray-400 placeholder:opacity-100 disabled:bg-[#ddd]"
                            />
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-1">
                            <button
                                type="button"
                                onClick={onToggle}
                                className="text-[10px] text-[#003399] hover:underline cursor-pointer pr-1"
                            >
                                {type === 'login' ? 'New User?' : 'Back'}
                            </button>
                            <XPButton type="submit" isLoading={isLoading}>
                                {type === 'login' ? 'OK' : 'Create'}
                            </XPButton>
                        </div>
                    </form>
                </div>
            </div>

            {/* Status Bar */}
            <div className="px-2 bg-[#E1E1D4] border-t border-[#ACA899] text-[9px] text-[#444] flex justify-between h-[18px] items-center">
                <span>Microsoft(R) Windows(R) XP</span>
                <span className="opacity-50">Logon UI</span>
            </div>
        </div>
    );
}
