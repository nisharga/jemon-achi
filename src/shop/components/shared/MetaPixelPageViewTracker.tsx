'use client';

import { trackMetaPageView } from '@/shop/lib/meta-pixel';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';

const MetaPixelPageViewTracker = () => {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const hasMounted = useRef(false);
    const query = searchParams?.toString();

    useEffect(() => {
        if (!pathname) return;

        // Initial PageView is already fired by base pixel snippet.
        if (!hasMounted.current) {
            hasMounted.current = true;
            return;
        }

        trackMetaPageView();
    }, [pathname, query]);

    return null;
};

export default MetaPixelPageViewTracker;
