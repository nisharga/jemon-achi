'use client';

import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};
const getClientYear = () => new Date().getFullYear();
// Prerender must not read the clock (Next.js cache components); fill in on the client.
const getServerYear = () => null;

/** Current year, resolved on the client so static prerendering stays deterministic. */
const CopyrightYear = () => {
    const year = useSyncExternalStore(subscribe, getClientYear, getServerYear);
    return <>{year ?? ''}</>;
};

export default CopyrightYear;
