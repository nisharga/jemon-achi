'use client';

import Pagination from '@/components/shared/pagination';
import React, { useEffect, useState } from 'react';
import { StockTransferTable } from './_components/stock-transfer-table';
import { useGetAllStockTransferQuery } from '@/redux/admin/api/stock-api';
import { PermissionErrorCard } from '@/components/shared/permission-error-card';
import { PermissionLoaderCard } from '@/components/shared/permission-loader-card';
import { useHasPermission } from '@/hooks/use-has-permission';
import { PermissionEnum } from '@/types/admin/permistion';

const AllStockTransferPage = () => {
    // === check permissions ===
    const { hasPermission, isPermissionLoading } = useHasPermission({
        permissions: [PermissionEnum.STOCK_VIEW]
    });

    // === api query states ===
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState<string | number>(20);

    // === get all stock transfers ===
    const { data, isLoading, isFetching } = useGetAllStockTransferQuery({
        page,
        limit
    });
    const stocks = data?.data?.stockTransferHistory;
    const stocksMeta = data?.data?.meta;

    // === paginations ===
    // === handling page change ===
    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };
    // === reset to first page whenover limit or other parameters were changed ===
    useEffect(() => {
        setPage(1);
    }, [limit]);

    // === loading and persmission error card ===
    if (!isPermissionLoading && !hasPermission) {
        return <PermissionErrorCard />;
    }
    if (isPermissionLoading) {
        return <PermissionLoaderCard />;
    }

    return (
        <section className='flex flex-col gap-6'>
            <div className='flex items-center justify-between gap-2'>
                <h1 className='text-2xl font-medium'>
                    Stock Transfer History ({stocksMeta?.total})
                </h1>
            </div>

            {/* table */}
            <StockTransferTable
                stocks={stocks}
                isLoading={isLoading}
                isFetching={isFetching}
            />
            {/* pagination */}
            {stocksMeta?.total > 0 && (
                <div className='rounded-lg bg-background p-2 shadow-md'>
                    <Pagination
                        limit={limit}
                        setLimit={setLimit}
                        currentPage={page}
                        onPageChange={handlePageChange}
                        totalItems={stocksMeta?.total}
                    />
                </div>
            )}
        </section>
    );
};

export default AllStockTransferPage;
