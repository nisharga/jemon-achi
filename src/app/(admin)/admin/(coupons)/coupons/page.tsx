'use client';
import { Button } from '@/components/ui/admin-button';
import Link from 'next/link';
import React, { Suspense, useEffect, useState } from 'react';
import { ProductsTable } from './_components/products-table';
import Pagination from '@/components/shared/pagination';
import { useHasPermission } from '@/hooks/use-has-permission';
import { PermissionEnum } from '@/types/admin/permistion';
import { PermissionErrorCard } from '@/components/shared/permission-error-card';
import { PermissionLoaderCard } from '@/components/shared/permission-loader-card';

import { useGetAllCouponsQuery } from '@/redux/admin/api/coupon-api';

const ProductsPageComponent = () => {
    // === check permissions ===
    const { hasPermission, isPermissionLoading } = useHasPermission({
        permissions: [PermissionEnum.PRODUCT_VIEW]
    });
    // === api query states ===
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState<string | number>(20);

    // === get all products ===
    const { data, isLoading, isFetching } = useGetAllCouponsQuery(
        {
            page,
            limit,
            searchQuery: ''
        },
        { refetchOnMountOrArgChange: true }
    );
    const coupons = data?.data?.coupons;
    const productsMeta = data?.data?.meta;

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
        <div className='flex flex-col gap-6'>
            <div className='flex items-center justify-between gap-2'>
                <h1 className='text-2xl font-medium'>
                    All Coupons ({productsMeta?.total || 0})
                </h1>

                <Button asChild className='ms-auto'>
                    <Link href='/admin/create-coupon'>Create Coupon</Link>
                </Button>
            </div>

            {/* table */}
            <ProductsTable
                products={coupons}
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
                    totalItems={productsMeta?.total}
                />
            </div>
        </div>
    );
};

const ProductsPage = () => {
    return (
        <Suspense fallback={<>Loading..</>}>
            <ProductsPageComponent />
        </Suspense>
    );
};

export default ProductsPage;
