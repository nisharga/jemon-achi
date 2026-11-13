'use client';

import { useMounted } from '@/hooks';
import { FC, useEffect, useRef } from 'react';

interface IProps {
    html: string;
    className?: string;
}

/** Renders a raw HTML string (including inline <script>) on the client only. */
const InnerHTML: FC<IProps> = ({ html, className }) => {
    const divRef = useRef<HTMLDivElement>(null);
    const isMounted = useMounted();

    useEffect(() => {
        const el = divRef.current;
        if (!isMounted || !el) return;

        const fragment = document.createRange().createContextualFragment(html);
        el.replaceChildren(fragment);
    }, [isMounted, html]);

    if (!isMounted) return null;

    return <div className={className} ref={divRef}></div>;
};

export default InnerHTML;
