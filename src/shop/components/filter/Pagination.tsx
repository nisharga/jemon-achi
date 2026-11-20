'use client';
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/shop/lib/utils';

interface IProps {
    isLoading: boolean;
    page: number;
    limit: number;
    total: number;
    setPage: (page: number) => void;
}

const Pagination = ({ isLoading, page, limit, total, setPage }: IProps) => {
    const totalPages = Math.ceil(total / limit);

    // If there's only one page or no data, don't show pagination
    if (totalPages <= 1 && !isLoading) return null;

    // Skeleton State
    if (isLoading) {
        return (
            <div className='my-8 flex animate-pulse items-center justify-end gap-2'>
                <div className='h-8 w-20 rounded bg-gray-200' />
                <div className='flex gap-2'>
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className='h-8 w-8 rounded bg-gray-200' />
                    ))}
                </div>
                <div className='h-8 w-20 rounded bg-gray-200' />
            </div>
        );
    }

    // Logic to generate page numbers with ellipsis
    const getPageNumbers = () => {
        const pages = [];
        const showEllipsis = totalPages > 7;

        if (!showEllipsis) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            // Always show first page
            pages.push(1);

            if (page > 4) pages.push('...');

            const start = Math.max(2, page - 2);
            const end = Math.min(totalPages - 1, page + 2);

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (page < totalPages - 3) pages.push('...');

            // Always show last page
            pages.push(totalPages);
        }
        return pages;
    };

    return (
        <div className='my-8 flex flex-wrap items-center justify-end gap-2'>
            <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className='flex items-center gap-1 rounded border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50'
            >
                <ChevronLeft className='h-4 w-4' />
                Previous
            </button>

            <div className='flex items-center gap-2'>
                {getPageNumbers().map((item, index) =>
                    item === '...' ? (
                        <span
                            key={`ellipsis-${index}`}
                            className='px-1 text-gray-400'
                        >
                            ...
                        </span>
                    ) : (
                        <button
                            key={`page-${item}`}
                            onClick={() => setPage(item as number)}
                            className={cn(
                                'h-8 w-8 rounded text-sm transition-colors',
                                page === item
                                    ? 'bg-primary font-medium text-white'
                                    : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                            )}
                        >
                            {item}
                        </button>
                    )
                )}
            </div>

            <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className='flex items-center gap-1 rounded border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50'
            >
                Next
                <ChevronRight className='h-4 w-4' />
            </button>
        </div>
    );
};

export default Pagination;
