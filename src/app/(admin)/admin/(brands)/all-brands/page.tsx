'use client';

import { useGetAllBrandsForAdminQuery } from '@/redux/api-queries/brand-api';
import React from 'react';
import { BrandsTable } from './_components/brands-table';
import { Button } from '@/components/ui/admin-button';
import Link from 'next/link';
import { useHasPermission } from '@/hooks/use-has-permission';
import { PermissionEnum } from '@/types/permistion';
import { PermissionErrorCard } from '@/components/shared/permission-error-card';
import { PermissionLoaderCard } from '@/components/shared/permission-loader-card';

const BrandsPage = () => {
    // === check permissions ===
    const { hasPermission, isPermissionLoading } = useHasPermission({
        permissions: [PermissionEnum.PRODUCT_VIEW]
    });

    // === get all brands ===
    const { data, isLoading, isFetching } = useGetAllBrandsForAdminQuery({
        page: 1,
        limit: 100,
        searchTerm: ''
    });

    const brands = data?.data?.brands || [];

    // === loading and permission error card ===
    if (!isPermissionLoading && !hasPermission) {
        return <PermissionErrorCard />;
    }
    if (isPermissionLoading) {
        return <PermissionLoaderCard />;
    }

    return (
        <div className='flex flex-col gap-6'>
            <div className='flex items-center justify-between gap-2'>
                <h1 className='text-2xl font-medium'>All Brands</h1>

                <Button asChild className='ms-auto'>
                    <Link href='/admin/create-brand'>Add new Brand</Link>
                </Button>
            </div>
            {/* table */}
            <BrandsTable
                brands={brands}
                isLoading={isLoading}
                isFetching={isFetching}
            />
        </div>
    );
};

export default BrandsPage;
