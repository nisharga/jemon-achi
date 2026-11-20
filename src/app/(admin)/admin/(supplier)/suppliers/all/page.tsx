'use client';

import React, { useEffect, useState } from 'react';
import Pagination from '@/admin/components/shared/pagination';
import { useHasPermission } from '@/admin/hooks/use-has-permission';
import { PermissionEnum } from '@/admin/types/permistion';
import { PermissionErrorCard } from '@/admin/components/shared/permission-error-card';
import { PermissionLoaderCard } from '@/admin/components/shared/permission-loader-card';
import { useGetAllSuppliersQuery } from '@/admin/redux/api-queries/supplier-slice';
import { SupplierTable } from './_components/supplier-table';

const AllSupplierPage = () => {
    // === check permissions ===
    const { hasPermission, isPermissionLoading } = useHasPermission({
        permissions: [PermissionEnum.SUPPLIER_VIEW]
    });

    // === api query states ===
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState<string | number>(20);

    // === get all suppliers ===
    const { data, isLoading, isFetching } = useGetAllSuppliersQuery({
        page: page,
        limit: limit
    });

    // Correct variable names - suppliers instead of businessLocations
    const suppliers = data?.data || [];
    const totalSuppliers = data?.data?.length || 0;
    console.log('totalSuppliers: ', totalSuppliers);

    // === paginations ===
    // === handling page change ===
    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    // === reset to first page whenever limit or other parameters were changed ===
    useEffect(() => {
        setPage(1);
    }, [limit]);

    // === loading and permission error card ===
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
                    Suppliers ({totalSuppliers})
                </h1>
            </div>

            {/* table */}
            <SupplierTable
                suppliers={suppliers}
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
                    totalItems={totalSuppliers}
                />
            </div>
        </section>
    );
};

export default AllSupplierPage;
