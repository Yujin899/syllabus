interface SoftNavBarProps {
    leftLabel?: string;
    rightLabel?: string;
    onLeftClick?: () => void;
    onRightClick?: () => void;
    disabled?: boolean;
}

export function SoftNavBar({
    leftLabel = 'Select',
    rightLabel = 'Exit',
    onLeftClick,
    onRightClick,
    disabled
}: SoftNavBarProps) {
    return (
        <div className="symbian-ui h-12 bg-(--symbian-softkey-bg) border-t border-(--symbian-border) flex items-center justify-between font-sans text-[11px] font-normal leading-none">
            {/* Left Soft Key Area */}
            <button
                onClick={onLeftClick}
                disabled={disabled}
                className="flex-1 h-full flex items-center justify-center bg-transparent active:bg-(--symbian-row-highlight) border-r border-(--symbian-border) disabled:opacity-30"
            >
                <span className="text-white uppercase tracking-tight">{leftLabel}</span>
            </button>

            {/* Hardware Branding Node (Classic Nokia speaker/divider look) */}
            <div className="w-8 h-full flex items-center justify-center gap-[2px] opacity-20">
                <div className="w-[1.5px] h-[1.5px] bg-white" />
                <div className="w-[1.5px] h-[1.5px] bg-white" />
                <div className="w-[1.5px] h-[1.5px] bg-white" />
            </div>

            {/* Right Soft Key Area */}
            <button
                onClick={onRightClick}
                disabled={disabled}
                className="flex-1 h-full flex items-center justify-center bg-transparent active:bg-(--symbian-row-highlight) border-l border-(--symbian-border) disabled:opacity-30"
            >
                <span className="text-white uppercase tracking-tight">{rightLabel}</span>
            </button>
        </div>
    );
}
