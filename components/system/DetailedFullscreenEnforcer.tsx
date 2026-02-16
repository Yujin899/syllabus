'use client';

import { useEffect } from 'react';

export function DetailedFullscreenEnforcer() {
    useEffect(() => {
        const handleInteraction = () => {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch((err) => {
                    // Ignore errors, e.g., if triggered without user interaction (though click should be valid)
                    console.warn(`Error attempting to enable fullscreen: ${err.message}`);
                });
            }
        };

        // Add listeners for common interactions
        document.addEventListener('click', handleInteraction);
        document.addEventListener('touchstart', handleInteraction);
        document.addEventListener('keydown', handleInteraction);

        return () => {
            document.removeEventListener('click', handleInteraction);
            document.removeEventListener('touchstart', handleInteraction);
            document.removeEventListener('keydown', handleInteraction);
        };
    }, []);

    return null;
}
