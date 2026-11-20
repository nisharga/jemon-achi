'use client';

import React, { useEffect, useState } from 'react';
import { useGetAllInventoriesQuery } from '@/admin/redux/api-queries/inventory-api';
import useDebounce from '@/admin/hooks/use-debounce';
import Pagination from '@/admin/components/shared/pagination';
import { Input } from '@/admin/components/ui/input';
import { BarcodeTable } from './_components/barcode-table';
import { PermissionEnum } from '@/admin/types/permistion';
import { useHasPermission } from '@/admin/hooks/use-has-permission';
import { PermissionErrorCard } from '@/admin/components/shared/permission-error-card';
import { PermissionLoaderCard } from '@/admin/components/shared/permission-loader-card';

const DownloadBarcode = () => {
    // === check permissions ===
    const { hasPermission, isPermissionLoading } = useHasPermission({
        permissions: [PermissionEnum.STOCK_VIEW]
    });

    // === product query states ===
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState<string | number>(20);
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearchQuery = useDebounce(searchQuery);

    // === get all Inventory ===
    const { data, isLoading, isFetching } = useGetAllInventoriesQuery({
        page,
        limit,
        searchQuery: debouncedSearchQuery
    });

    const inventories = data?.data?.data;
    const inventoriesMeta = data?.data?.meta;

    // === paginations ===
    // === handling page change ===
    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };
    // === reset to first page whenover limit or other parameters were changed ===
    useEffect(() => {
        setPage(1);
    }, [limit, searchQuery]);

    // === loading and persmission error card ===
    if (!isPermissionLoading && !hasPermission) {
        return <PermissionErrorCard />;
    }
    if (isPermissionLoading) {
        return <PermissionLoaderCard />;
    }

    return (
        <div className='flex flex-col gap-6'>
            <div className='flex items-center justify-between gap-2 print:hidden'>
                <h1 className='text-2xl font-medium'>Barcodes</h1>
            </div>
            <div className='rounded-lg bg-background p-2 shadow-md print:hidden'>
                <h3 className='pb-2 text-lg font-medium'>Search & Filter</h3>
                <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-4'>
                    <Input
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder='Search by SKU'
                    />
                </div>
            </div>

            <BarcodeTable
                inventories={inventories}
                isLoading={isLoading}
                isFetching={isFetching}
            />

            {/* pagination */}
            {inventoriesMeta?.total > 0 && (
                <div className='rounded-lg bg-background p-2 shadow-md print:hidden'>
                    <Pagination
                        limit={limit}
                        setLimit={setLimit}
                        currentPage={page}
                        onPageChange={handlePageChange}
                        totalItems={inventoriesMeta?.total || 0}
                    />
                </div>
            )}
        </div>
    );
};

export default DownloadBarcode;
