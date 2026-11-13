'use client';

import AOS from 'aos';
import 'aos/dist/aos.css';
import { useEffect } from 'react';

/**
 * Starts AOS scroll animations.
 *
 * AOS adds `aos-init` classes to every `[data-aos]` element. Next.js hydrates
 * the layout and the page as separate boundaries, so initialising straight
 * away in an effect can touch page elements React has not hydrated yet and
 * trigger hydration-mismatch warnings. Waiting for the window `load` event
 * plus an idle tick lets hydration finish first.
 */
export const AOSInit = () => {
    useEffect(() => {
        let idleId: number | undefined;
        let timeoutId: ReturnType<typeof setTimeout> | undefined;

        const init = () =>
            AOS.init({
                easing: 'ease-out-quad',
                duration: 1000
            });

        const scheduleInit = () => {
            if ('requestIdleCallback' in window) {
                idleId = window.requestIdleCallback(init, { timeout: 1500 });
            } else {
                timeoutId = setTimeout(init, 200);
            }
        };

        if (document.readyState === 'complete') {
            scheduleInit();
        } else {
            window.addEventListener('load', scheduleInit, { once: true });
        }

        return () => {
            window.removeEventListener('load', scheduleInit);
            if (idleId !== undefined) window.cancelIdleCallback(idleId);
            if (timeoutId !== undefined) clearTimeout(timeoutId);
        };
    }, []);

    return null;
};
