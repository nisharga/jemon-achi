'use client';

import React, { useEffect, useState } from 'react';
// import { CustomersTable } from "./_components/customers-table";
import Pagination from '@/admin/components/shared/pagination';
import { useHasPermission } from '@/admin/hooks/use-has-permission';
import { PermissionEnum } from '@/admin/types/permistion';
import { PermissionErrorCard } from '@/admin/components/shared/permission-error-card';
import { PermissionLoaderCard } from '@/admin/components/shared/permission-loader-card';
import { CustomersTable } from './_components/customers-table';
import { useGetAllFaqsQuery } from '@/admin/redux/api-queries/faq-api';
import { Button } from '@/admin/components/ui/button';
import Link from 'next/link';

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
    const { data: apiResponse, isLoading, isFetching } = useGetAllFaqsQuery({});

    const faqs = apiResponse?.data?.faqs || [];
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
                    <h1 className='text-2xl font-medium'>Product FAQS</h1>

                    <div className='flex items-center justify-center gap-3'>
                        {/* Search Input */}
                        <div className='w-64'>
                            <input
                                type='text'
                                placeholder='Search Faqs...'
                                value={searchQuery}
                                onChange={handleSearch}
                                className='hidden w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none'
                            />
                        </div>
                        <Button asChild className='ms-auto'>
                            <Link href='/admin/product-faqs/add-new-faq'>
                                Add new Faq
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>

            {/* table */}
            <CustomersTable
                customers={faqs}
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
