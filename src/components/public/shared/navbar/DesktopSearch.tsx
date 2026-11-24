'use client';

import { useRef, useState, type KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { useClickOutside } from '@/hooks/use-click-outside';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import SearchResults from './SearchResults';

/** Search icon in the desktop header; opens a search box with live suggestions. */
export default function DesktopSearch() {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [term, setTerm] = useState('');
    const debouncedTerm = useDebouncedValue(term.trim(), 300);

    const boxRef = useRef<HTMLDivElement>(null);
    useClickOutside(boxRef, () => setIsOpen(false));

    const close = () => {
        setIsOpen(false);
        setTerm('');
    };

    // Enter opens the full search page.
    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' && term.trim()) {
            router.push(`/search?q=${encodeURIComponent(term.trim())}`);
            close();
        }
    };

    return (
        <div ref={boxRef} className='relative'>
            <button
                type='button'
                onClick={() => setIsOpen(!isOpen)}
                aria-label={isOpen ? 'Close search' : 'Search products'}
                aria-expanded={isOpen}
                className='rounded-full p-2 text-gray-900 hover:bg-gray-100'
            >
                {isOpen ? (
                    <X className='size-6' />
                ) : (
                    <Search className='size-6' />
                )}
            </button>

            {isOpen && (
                <div className='absolute top-full right-0 z-60 mt-3 w-[350px] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl'>
                    <label className='relative block'>
                        <span className='sr-only'>Search products</span>
                        <Search
                            className='absolute top-1/2 left-4 size-5 -translate-y-1/2 text-gray-600'
                            aria-hidden='true'
                        />
                        <input
                            autoFocus
                            type='search'
                            placeholder='Search products...'
                            value={term}
                            onChange={(event) => setTerm(event.target.value)}
                            onKeyDown={handleKeyDown}
                            className='w-full py-4 pr-5 pl-12 text-gray-900 focus:outline-none'
                        />
                    </label>

                    <div className='border-t border-gray-100'>
                        {debouncedTerm ? (
                            <SearchResults
                                term={debouncedTerm}
                                limit={5}
                                onPick={close}
                            />
                        ) : (
                            <p className='p-4 text-center text-sm text-gray-600'>
                                Type to see suggestions
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
