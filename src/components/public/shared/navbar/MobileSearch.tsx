'use client';

import { useRef, useState, type KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { useClickOutside } from '@/hooks/use-click-outside';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import SearchResults from './SearchResults';

type Props = { isOpen: boolean; onClose: () => void };

/** Full-width search panel that drops down under the header on phones. */
export default function MobileSearch({ isOpen, onClose }: Props) {
    const panelRef = useRef<HTMLDivElement>(null);
    useClickOutside(panelRef, onClose);

    if (!isOpen) return null;

    return (
        <div
            ref={panelRef}
            className='fixed top-[92px] right-0 left-0 z-60 max-h-[75vh] overflow-hidden border-t border-gray-200 bg-white shadow-xl lg:hidden'
        >
            {/* Separate component so the typed text resets each time the panel opens. */}
            <SearchPanel onClose={onClose} />
        </div>
    );
}

function SearchPanel({ onClose }: { onClose: () => void }) {
    const router = useRouter();
    const [term, setTerm] = useState('');
    const debouncedTerm = useDebouncedValue(term.trim(), 400);

    // Enter opens the full search page.
    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' && term.trim()) {
            router.push(`/search?q=${encodeURIComponent(term.trim())}`);
            onClose();
        }
    };

    return (
        <>
            <div className='flex items-center gap-2 border-b border-gray-100 p-2'>
                <label className='relative flex-1'>
                    <span className='sr-only'>Search products</span>
                    <Search
                        className='absolute top-1/2 left-4 size-5 -translate-y-1/2 text-gray-900'
                        aria-hidden='true'
                    />
                    <input
                        autoFocus
                        type='search'
                        placeholder='What are you looking for?'
                        value={term}
                        onChange={(event) => setTerm(event.target.value)}
                        onKeyDown={handleKeyDown}
                        className='w-full rounded-2xl border-2 border-gray-200 bg-gray-50 py-2 pr-4 pl-12 text-sm focus:border-primary focus:bg-white focus:outline-none'
                    />
                </label>
                <button
                    type='button'
                    onClick={onClose}
                    aria-label='Close search'
                    className='rounded-full bg-primary p-2 text-primary-foreground'
                >
                    <X className='size-5' />
                </button>
            </div>

            <div
                className='overflow-y-auto p-2'
                style={{ maxHeight: 'calc(75vh - 80px)' }}
            >
                {debouncedTerm ? (
                    <SearchResults
                        term={debouncedTerm}
                        limit={3}
                        onPick={onClose}
                    />
                ) : (
                    <p className='py-2 text-center text-xs text-gray-600'>
                        Start typing to see product suggestions.
                    </p>
                )}
            </div>
        </>
    );
}
