'use client';

import { useState, useEffect } from 'react';

export type DeviceType = 'desktop' | 'mobile' | null;

export function useDeviceType() {
    const [deviceType, setDeviceType] = useState<DeviceType>(null);

    useEffect(() => {
        const checkDevice = () => {
            // Symbian vibes often come from small screens
            // Mobile logic: width < 768px (standard md breakpoint)
            if (window.innerWidth < 768) {
                setDeviceType('mobile');
            } else {
                setDeviceType('desktop');
            }
        };

        checkDevice();
        window.addEventListener('resize', checkDevice);
        return () => window.removeEventListener('resize', checkDevice);
    }, []);

    return deviceType;
}
