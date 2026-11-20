'use client';
import React, { useEffect, useState } from 'react';
import { Search, Filter, ChevronDown, CheckIcon } from 'lucide-react';
import * as Select from '@radix-ui/react-select';
import * as Label from '@radix-ui/react-label';
import useDebounce from '@/shop/hooks/use-debounce';
import { Container } from '@/shop/components/common/container';
import { formatSlugToTitle } from '@/shop/lib/utils';

interface FilterHeaderProps {
    title?: string;
    totalItems?: number;
    sortBy: string;
    setSortBy: (value: string) => void;
    onSearch: (value: string) => void;
    onMobileFilterOpen: () => void;
}

const FilterHeader = ({
    title,
    totalItems = 0,
    sortBy,
    setSortBy,
    onSearch,
    onMobileFilterOpen
}: FilterHeaderProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch] = useDebounce(searchTerm);

    // Trigger search only after debounce delay
    useEffect(() => {
        onSearch(debouncedSearch);
    }, [debouncedSearch, onSearch]);

    return (
        <div className='border-b bg-white sm:sticky sm:top-0 sm:z-30'>
            <Container className='py-4 sm:py-6'>
                {/* Top Row: Title & Mobile Filter Toggle */}
                <div className='mb-4 flex items-center justify-between'>
                    <div>
                        <h1 className='text-lg leading-tight font-medium text-gray-900 sm:text-2xl'>
                            {formatSlugToTitle(`${title}`)}
                        </h1>
                        <p className='text-xs text-gray-500 sm:text-sm'>
                            {totalItems} items found
                        </p>
                    </div>

                    <div className='flex gap-2'>
                        <div className='block lg:hidden'>
                            <SortDropdown
                                sortBy={sortBy}
                                setSortBy={setSortBy}
                            />
                        </div>

                        <button
                            onClick={onMobileFilterOpen}
                            className='flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 active:bg-gray-100 lg:hidden'
                        >
                            <Filter className='h-4 w-4' />
                            <span className='hidden xs:inline'>Filters</span>
                        </button>
                    </div>
                </div>

                {/* Bottom Row: Search & Sort (Responsive flexbox) */}
                <div className='flex flex-col items-center gap-0 sm:gap-4 md:flex-row'>
                    {/* Search Input Box */}
                    <div className='relative w-full flex-grow'>
                        <input
                            type='text'
                            placeholder='Search for items...'
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e?.target?.value)}
                            className='w-full rounded-lg border border-gray-300 px-4 py-2 pr-10 text-sm transition-all focus:border-transparent focus:ring-2 focus:ring-orange-500 focus:outline-none sm:text-base'
                        />
                        <div className='absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded bg-orange-500 text-white sm:top-1 sm:right-1 sm:h-8 sm:w-8'>
                            <Search className='h-4 w-4' />
                        </div>
                    </div>

                    {/* Sort Dropdown */}
                    <div className='flex w-full shrink-0 items-center sm:gap-3 md:w-auto'>
                        <Label.Root
                            htmlFor='sort'
                            className='hidden text-sm font-semibold whitespace-nowrap text-gray-700 lg:block'
                        >
                            Sort by:
                        </Label.Root>

                        <div className='hidden lg:block'>
                            <SortDropdown
                                sortBy={sortBy}
                                setSortBy={setSortBy}
                            />
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    );
};

export default FilterHeader;

const SortDropdown = ({ sortBy, setSortBy }: any) => {
    return (
        <Select.Root value={sortBy} onValueChange={setSortBy}>
            <Select.Trigger className='inline-flex w-full min-w-[160px] items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm transition-all hover:bg-gray-50 focus:ring-2 focus:ring-orange-500 focus:outline-none md:min-w-[200px]'>
                {/* Select.Value will show the placeholder only if sortBy is an empty string */}
                <Select.Value placeholder='Default' />
                <Select.Icon>
                    <ChevronDown className='ml-2 h-4 w-4 text-gray-500' />
                </Select.Icon>
            </Select.Trigger>

            <Select.Portal>
                <Select.Content
                    position='popper'
                    sideOffset={5}
                    className='z-[1001] w-[var(--radix-select-trigger-width)] overflow-hidden rounded-md border border-gray-200 bg-white shadow-xl'
                >
                    <Select.Viewport className='p-1'>
                        {[
                            { value: 'asc', label: 'Price: Low to High' },
                            { value: 'desc', label: 'Price: High to Low' }
                        ].map((item) => (
                            <Select.Item
                                key={item.value}
                                value={item.value}
                                className='relative flex cursor-pointer items-center rounded px-8 py-2.5 text-xs text-gray-700 transition-colors outline-none hover:bg-orange-50 focus:bg-orange-100 data-[state=checked]:font-medium data-[state=checked]:text-orange-600 sm:text-sm'
                            >
                                <Select.ItemText>{item.label}</Select.ItemText>
                                <Select.ItemIndicator className='absolute left-2 text-orange-600'>
                                    <CheckIcon className='h-4 w-4' />
                                </Select.ItemIndicator>
                            </Select.Item>
                        ))}
                    </Select.Viewport>
                </Select.Content>
            </Select.Portal>
        </Select.Root>
    );
};
