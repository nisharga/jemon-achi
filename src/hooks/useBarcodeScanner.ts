'use client';

import { useEffect, useRef } from 'react';

type Options = {
    //== Max ms between characters to treat as a scan burst ==
    charThresholdMs?: number;
    //== If Enter isn't sent, end a burst after this many ms idle ==
    burstEndMs?: number;
    //== Minimum length to accept as a scan ==
    minLength?: number;
    //==  Whether to ignore if the active element is an input/textarea/contenteditable ==
    ignoreWhenFocusingEditable?: boolean;
};

export default function useBarcodeScanner(
    onScan: (code: string) => void,
    {
        charThresholdMs = 35,
        burstEndMs = 200,
        minLength = 50,
        ignoreWhenFocusingEditable = true
    }: Options = {}
) {
    const bufferRef = useRef('');
    const lastTsRef = useRef<number>(0);
    const timerRef = useRef<number | null>(null);

    useEffect(() => {
        const isEditable = (el: Element | null) => {
            if (!el || !(el as HTMLElement)) return false;
            const tag = (el as HTMLElement).tagName;
            if (
                tag === 'INPUT' ||
                tag === 'TEXTAREA' ||
                (el as HTMLElement).isContentEditable
            )
                return true;
            return false;
        };

        const flush = () => {
            const code = bufferRef.current;
            bufferRef.current = '';
            if (code.length >= minLength) onScan(code);
        };

        const onKeyDown = (e: KeyboardEvent) => {
            const now = Date.now();

            if (
                ignoreWhenFocusingEditable &&
                isEditable(document.activeElement)
            ) {
                //== Let normal typing in inputs work ==
                return;
            }

            // Finish on Enter
            if (e.key === 'Enter') {
                e.preventDefault();
                flush();
                return;
            }

            //== Only characters (ignore modifiers/arrows/etc) ==
            if (e.key.length !== 1) return;

            const delta = now - (lastTsRef.current || 0);

            //== If too slow, start a new burst ==
            if (delta > charThresholdMs) {
                bufferRef.current = '';
            }

            bufferRef.current += e.key;
            lastTsRef.current = now;

            //== Arm/refresh a timer to auto-flush if Enter isn't sent ==
            if (timerRef.current) window.clearTimeout(timerRef.current);
            timerRef.current = window.setTimeout(() => {
                flush();
            }, burstEndMs) as unknown as number;
        };

        window.addEventListener('keydown', onKeyDown);
        return () => {
            window.removeEventListener('keydown', onKeyDown);
            if (timerRef.current) window.clearTimeout(timerRef.current);
        };
    }, [
        onScan,
        charThresholdMs,
        burstEndMs,
        minLength,
        ignoreWhenFocusingEditable
    ]);
}
