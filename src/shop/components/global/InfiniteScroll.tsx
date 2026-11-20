'use client';
import { useRef, useCallback, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface InfiniteScrollProps {
    hasMore: boolean;
    isLoading: boolean;
    next: () => void;
    children: React.ReactNode;
}

export const InfiniteScroll = ({
    hasMore,
    isLoading,
    next,
    children
}: InfiniteScrollProps) => {
    const observer = useRef<IntersectionObserver | null>(null);
    const hasTriggeredRef = useRef(false);

    // Reset the trigger when loading completes so the next intersection can be processed
    useEffect(() => {
        if (!isLoading) {
            hasTriggeredRef.current = false;
        }
    }, [isLoading]);

    // This is the "Sentinel" ref
    const lastElementRef = useCallback(
        (node: HTMLDivElement | null) => {
            if (observer.current) observer.current.disconnect();
            if (!node) return;

            observer.current = new IntersectionObserver((entries) => {
                const entry = entries[0];
                if (
                    entry.isIntersecting &&
                    hasMore &&
                    !isLoading &&
                    !hasTriggeredRef.current
                ) {
                    hasTriggeredRef.current = true;
                    next();
                }
            });

            observer.current.observe(node);
        },
        [hasMore, isLoading, next]
    );

    return (
        <>
            {children}

            {/* Target div to watch */}
            <div
                ref={lastElementRef}
                className='flex h-10 w-full items-center justify-center'
            >
                {isLoading && (
                    <Loader2 className='animate-spin text-primary' size={24} />
                )}
            </div>
        </>
    );
};
