'use client';

import { Children, useRef, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * A horizontal row of items that scrolls sideways: 2 visible on phones,
 * 5 on large screens. Swipe on touch screens, arrow buttons on desktop.
 *
 * It replaces Swiper: scrolling and snapping are plain CSS, so the items are
 * server-rendered and visible immediately, and the only JavaScript here is
 * the two arrow buttons.
 */
export default function ProductRail({
    children,
    label
}: {
    children: ReactNode;
    /** Read out by screen readers, e.g. "Best selling products". */
    label: string;
}) {
    const rowRef = useRef<HTMLUListElement>(null);

    // Move by one screen-width of items.
    const scroll = (direction: 'left' | 'right') => {
        const row = rowRef.current;
        if (!row) return;
        const distance = row.clientWidth * (direction === 'left' ? -1 : 1);
        row.scrollBy({ left: distance, behavior: 'smooth' });
    };

    return (
        <div className='group/rail relative'>
            <ul
                ref={rowRef}
                aria-label={label}
                className='no-scrollbar flex snap-x snap-mandatory gap-2 overflow-x-auto scroll-smooth lg:gap-5'
            >
                {Children.map(children, (child) => (
                    <li className='w-[calc((100%-0.5rem)/2)] shrink-0 snap-start lg:w-[calc((100%-5rem)/5)]'>
                        {child}
                    </li>
                ))}
            </ul>

            <button
                type='button'
                onClick={() => scroll('left')}
                aria-label='Scroll left'
                className='absolute top-[40%] -left-5 z-10 hidden size-10 items-center justify-center rounded-full bg-primary text-primary-foreground opacity-0 shadow-md transition-opacity group-hover/rail:opacity-100 hover:bg-black hover:text-white lg:flex'
            >
                <ChevronLeft size={24} />
            </button>
            <button
                type='button'
                onClick={() => scroll('right')}
                aria-label='Scroll right'
                className='absolute top-[40%] -right-5 z-10 hidden size-10 items-center justify-center rounded-full bg-primary text-primary-foreground opacity-0 shadow-md transition-opacity group-hover/rail:opacity-100 hover:bg-black hover:text-white lg:flex'
            >
                <ChevronRight size={24} />
            </button>
        </div>
    );
}
