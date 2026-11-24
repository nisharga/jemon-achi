import { useEffect, type RefObject } from 'react';

/** Calls `onOutside` when the user clicks outside `ref` or presses Escape. */
export const useClickOutside = (
    ref: RefObject<HTMLElement | null>,
    onOutside: () => void
) => {
    useEffect(() => {
        const handleClick = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                onOutside();
            }
        };
        const handleKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onOutside();
        };

        document.addEventListener('mousedown', handleClick);
        document.addEventListener('keydown', handleKey);
        return () => {
            document.removeEventListener('mousedown', handleClick);
            document.removeEventListener('keydown', handleKey);
        };
    }, [ref, onOutside]);
};
