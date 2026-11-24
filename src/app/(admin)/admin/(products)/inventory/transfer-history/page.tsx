'use client';

import { useGetAllInventoryTransfaredHistoryQuery } from '@/redux/admin/api/inventory-api';
import React, { useEffect, useState } from 'react';
import { InventoryTransferHistoryTable } from './_components/inventory-transfer-history-table';
import Pagination from '@/components/shared/pagination';

const InventoryTransferHistoryPage = () => {
    // === api query states ===
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState<string | number>(20);

    // === get all products ===
    const { data, isLoading, isFetching } =
        useGetAllInventoryTransfaredHistoryQuery({
            page,
            limit
        });
    const inventoryHistories = data?.data?.data;
    const inventoryHistoriesMeta = data?.data?.meta;
    // console.log("inventoryHistories", inventoryHistories);

    // === paginations ===
    // === handling page change ===
    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };
    // === reset to first page whenover limit or other parameters were changed ===
    useEffect(() => {
        setPage(1);
    }, [limit]);

    return (
        <div className='flex flex-col gap-6'>
            <div className='flex items-center justify-between gap-2'>
                <h1 className='text-2xl font-medium'>
                    Inventory Transfer History ({inventoryHistoriesMeta?.total})
                </h1>
            </div>

            {/* table */}
            <InventoryTransferHistoryTable
                inventory_histories={inventoryHistories}
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
                    totalItems={inventoryHistoriesMeta?.total}
                />
            </div>
        </div>
    );
};

export default InventoryTransferHistoryPage;
