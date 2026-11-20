'use client';
import React, { useEffect, useState } from 'react';
import { Search, Filter, ChevronDown, CheckIcon } from 'lucide-react';
import * as Select from '@radix-ui/react-select';
import * as Label from '@radix-ui/react-label';
import useDebounce from '@/shop/hooks/use-debounce';
import { Container } from '@/shop/components/common/container';

interface FilterHeaderProps {
    totalItems?: number;
    sortBy: string;
    setSortBy: (value: string) => void;
    onSearch: (value: string) => void;
    onMobileFilterOpen: () => void;
}

const FilterHeader = ({
    totalItems = 0,
    sortBy,
    setSortBy,
    onSearch,
    onMobileFilterOpen
}: FilterHeaderProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch] = useDebounce(searchTerm, 500);

    // Trigger search only after debounce delay
    useEffect(() => {
        onSearch(debouncedSearch);
    }, [debouncedSearch, onSearch]);

    return (
        <div className='sm:sticky sm:top-0 sm:z-30'>
            <Container className='py-4 sm:py-6'>
                {/* Top Row: Title & Mobile Filter Toggle */}
                <div className='mb-4 flex items-center justify-between'>
                    <div>
                        <h1 className='text-lg leading-tight font-bold text-gray-900 sm:text-2xl'>
                            Featured Products
                        </h1>
                        <p className='text-xs text-gray-500 sm:text-sm'>
                            {totalItems} items found
                        </p>
                    </div>
                </div>
            </Container>
        </div>
    );
};

export default FilterHeader;
