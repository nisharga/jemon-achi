'use client';

import { useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useClickOutside } from '@/hooks/use-click-outside';
import { cn } from '@/lib/public-utils';
import type { NavCategory } from './types';

/** Categories shown in the bar: 5 on large screens, 7 on extra-large ones. The rest go under "More". */
const SHOWN_ON_LARGE = 5;
const SHOWN_ON_XL = 7;

type Props = {
    categories: NavCategory[];
    activeName: string | null;
    onHover: (name: string) => void;
};

/** Category names in the desktop header. Hovering one opens its mega menu. */
export default function CategoryMenu({
    categories,
    activeName,
    onHover
}: Props) {
    const [isMoreOpen, setIsMoreOpen] = useState(false);
    const moreRef = useRef<HTMLDivElement>(null);
    useClickOutside(moreRef, () => setIsMoreOpen(false));

    const inBar = categories.slice(0, SHOWN_ON_XL);
    const inMore = categories.slice(SHOWN_ON_LARGE);

    return (
        <>
            {inBar.map((category, index) => (
                <button
                    key={category._id}
                    type='button'
                    onMouseEnter={() => onHover(category.name_en)}
                    className={cn(
                        'nav-link relative h-full items-center hover:text-black',
                        // Categories 6 and 7 only fit on extra-large screens.
                        index < SHOWN_ON_LARGE ? 'flex' : 'hidden xl:flex'
                    )}
                >
                    {category.name_en}
                    {activeName === category.name_en && (
                        <span className='absolute right-0 -bottom-1 left-0 h-0.5 bg-black' />
                    )}
                </button>
            ))}

            {inMore.length > 0 && (
                <div
                    ref={moreRef}
                    className={cn(
                        'relative',
                        // On extra-large screens "More" is only needed past 7 categories.
                        categories.length <= SHOWN_ON_XL && 'xl:hidden'
                    )}
                >
                    <button
                        type='button'
                        onClick={() => setIsMoreOpen(!isMoreOpen)}
                        aria-expanded={isMoreOpen}
                        className='nav-link flex items-center gap-1.5 hover:text-black'
                    >
                        More
                        <ChevronDown
                            aria-hidden='true'
                            className={cn(
                                'size-4 transition-transform',
                                isMoreOpen && 'rotate-180'
                            )}
                        />
                    </button>

                    {isMoreOpen && (
                        <ul className='absolute top-full left-0 z-50 mt-5 min-w-max overflow-hidden rounded-lg border border-gray-200 bg-white py-2 shadow-xl'>
                            {inMore.map((category, index) => (
                                <li
                                    key={category._id}
                                    // Already in the bar on extra-large screens.
                                    className={cn(
                                        SHOWN_ON_LARGE + index < SHOWN_ON_XL &&
                                            'xl:hidden'
                                    )}
                                >
                                    <button
                                        type='button'
                                        onMouseEnter={() =>
                                            onHover(category.name_en)
                                        }
                                        onClick={() => setIsMoreOpen(false)}
                                        className='nav-link block w-full px-4 py-2 text-left hover:bg-gray-50'
                                    >
                                        {category.name_en}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </>
    );
}
