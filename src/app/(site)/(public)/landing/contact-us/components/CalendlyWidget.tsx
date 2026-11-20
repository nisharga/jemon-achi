'use client';

import Script from 'next/script';
import { useRef } from 'react';

const CALENDLY_URL = 'https://calendly.com/truup/book-for-free-consultation';

interface ICalendly {
    initInlineWidget: (options: {
        url: string;
        parentElement: HTMLElement;
    }) => void;
}

/**
 * Calendly booking calendar. The third-party script loads with
 * `lazyOnload` (after the page is idle) so it never competes with the
 * page's own content; the height is reserved up front so nothing shifts.
 */
const CalendlyWidget = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    // Runs on first load and again every time the page is re-mounted.
    const init = () => {
        const calendly = (window as Window & { Calendly?: ICalendly }).Calendly;
        const el = containerRef.current;
        if (!calendly || !el || el.childElementCount > 0) return;
        calendly.initInlineWidget({ url: CALENDLY_URL, parentElement: el });
    };

    return (
        <>
            <div ref={containerRef} className='relative h-[800px]' />
            <Script
                src='https://assets.calendly.com/assets/external/widget.js'
                strategy='lazyOnload'
                onReady={init}
            />
        </>
    );
};

export default CalendlyWidget;
