import React from 'react';

type PaginationProps = {
    page: number;
    limit: number;
    total: number;
    onPageChange: (page: number) => void;
};

const Pagination: React.FC<PaginationProps> = ({
    page,
    limit,
    total,
    onPageChange
}) => {
    const totalPages = Math.ceil(total / limit);
    const isFirstPage = page === 1;
    const isLastPage = page === totalPages || total === 0;

    return (
        <div className='flex items-center justify-center gap-4 lg:mt-6'>
            {/* Prev Button */}
            <button
                onClick={() => !isFirstPage && onPageChange(page - 1)}
                disabled={isFirstPage}
                className={`rounded-md border px-4 py-2 transition ${
                    isFirstPage
                        ? 'cursor-not-allowed border-gray-300 text-gray-600'
                        : 'border-gray-400 text-gray-800 hover:bg-gray-100'
                }`}
            >
                Prev
            </button>

            {/* Next Button */}
            <button
                onClick={() => !isLastPage && onPageChange(page + 1)}
                disabled={isLastPage}
                className={`rounded-md border px-3 py-1.5 transition lg:px-4 lg:py-2 ${
                    isLastPage
                        ? 'cursor-not-allowed border-gray-300 text-gray-600'
                        : 'border-gray-400 text-gray-800 hover:bg-gray-100'
                }`}
            >
                Next
            </button>
        </div>
    );
};

export default Pagination;
