import { cn } from '@/lib/utils';

interface XPButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary';
    isLoading?: boolean;
}

export function XPButton({ className, variant = 'primary', isLoading, children, disabled, ...props }: XPButtonProps) {
    return (
        <button
            disabled={disabled || isLoading}
            className={cn(
                'xp-ui w-[75px] h-[23px] flex items-center justify-center p-0 border-2 rounded-[3px] cursor-default relative',
                // Primary: Blue theme (Luna style)
                variant === 'primary' &&
                'bg-linear-to-b from-[#0055EE] to-[#0033BB] text-white border-[#003399]',
                // Secondary: Gray theme
                variant === 'secondary' &&
                'bg-[#ECE9D8] text-black border-[#808080]',
                // Classic XP Outset style
                'xp-border-outset active:xp-border-inset active:bg-[#DEDBC3]',
                (disabled || isLoading) && 'opacity-60 cursor-not-allowed grayscale-[0.5]',
                className
            )}
            {...props}
        >
            {isLoading ? (
                <div className="flex items-center justify-center">
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white animate-spin" />
                </div>
            ) : (
                children
            )}
        </button>
    );
}
