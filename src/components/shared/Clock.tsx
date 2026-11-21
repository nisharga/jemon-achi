'use client'; // This is critical for Next.js!

import { useState, useEffect } from 'react';

export default function Clock() {
    const [time, setTime] = useState<Date | null>(null); // Start with null to avoid hydration mismatch

    useEffect(() => {
        // Set initial time on mount
        setTime(new Date());

        const timer = setInterval(() => {
            setTime(new Date());
        }, 60000);

        return () => clearInterval(timer);
    }, []);

    // Don't render anything until the client-side code runs
    if (!time) return <div className='hidden px-3 py-1 md:block'>...</div>;

    return (
        <div className='hidden rounded-md bg-white/10 px-3 py-1 font-semibold md:block'>
            {time
                .toLocaleString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                })
                .replace(/,/g, '')}
        </div>
    );
}
