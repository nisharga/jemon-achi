import { useEffect, useState } from 'react';

/** `value`, but only updated after it has stopped changing for `delay` ms (e.g. while typing). */
export const useDebouncedValue = <T>(value: T, delay = 300): T => {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debounced;
};
