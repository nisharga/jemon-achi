'use client';

import React, { useEffect, useState } from 'react';
// import { CustomersTable } from "./_components/customers-table";
import Pagination from '@/components/shared/pagination';
import { useHasPermission } from '@/hooks/use-has-permission';
import { PermissionEnum } from '@/types/admin/permistion';
import { PermissionErrorCard } from '@/components/shared/permission-error-card';
import { PermissionLoaderCard } from '@/components/shared/permission-loader-card';
import { useGetAllReviewsQuery } from '@/redux/admin/api/reviews-api';
import { CustomersTable } from './_components/customers-table';
// import { useGetAllReviewsQuery } from "@/redux/admin/api/reviews-api";

const CustomersPage = () => {
    // === check permissions ===
    const { hasPermission, isPermissionLoading } = useHasPermission({
        permissions: [PermissionEnum.USER_VIEW]
    });

    // === api query states ===
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState<string | number>(20);
    const [searchQuery, setSearchQuery] = useState('');

    // === API queries ===
    // For paginated display
    const {
        data: apiResponse,
        isLoading,
        isFetching
    } = useGetAllReviewsQuery({});

    const reviews = apiResponse?.data?.data || [];
    console.log('reviews: ', reviews);
    const meta = apiResponse?.data?.meta;
    console.log('meta: ', meta);

    // === paginations ===
    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    useEffect(() => {
        setPage(1);
    }, [limit, searchQuery]);

    // === handle search ===
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    // === loading and permission error card ===
    if (!isPermissionLoading && !hasPermission) {
        return <PermissionErrorCard />;
    }
    if (isPermissionLoading) {
        return <PermissionLoaderCard />;
    }

    return (
        <section className='flex flex-col gap-6'>
            <div className='flex flex-col gap-4'>
                <div className='flex items-center justify-between gap-2'>
                    <h1 className='text-2xl font-medium'>Product Reviews</h1>

                    <div className='flex items-center justify-center gap-3'>
                        {/* Search Input */}
                        <div className='w-64'>
                            <input
                                type='text'
                                placeholder='Search Reviews...'
                                value={searchQuery}
                                onChange={handleSearch}
                                className='w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none'
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* table */}
            <CustomersTable
                customers={reviews}
                isLoading={isLoading}
                isFetching={isFetching}
            />

            {/* pagination */}
            <div className='rounded-lg bg-background p-2 shadow-md'>
                <Pagination
                    limit={limit}
                    setLimit={setLimit}
                    currentPage={page}
                    onPageChange={handlePageChange}
                    totalItems={20}
                />
            </div>
        </section>
    );
};

export default CustomersPage;
