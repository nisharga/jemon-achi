import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

/**
 * Returns `false` during SSR and the hydration render, `true` afterwards.
 * Use it to defer browser-only UI (theme toggles, embeds) without calling
 * setState inside an effect.
 */
export const useMounted = (): boolean =>
    useSyncExternalStore(
        subscribe,
        () => true,
        () => false
    );
