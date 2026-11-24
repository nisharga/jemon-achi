'use client';

import { useGetAllCategoriesQuery } from '@/redux/admin/api/category-api';
import React from 'react';
import { CategoriesTable } from './_components/categories-table';
import { Button } from '@/components/ui/admin-button';
import Link from 'next/link';
import { useHasPermission } from '@/hooks/use-has-permission';
import { PermissionEnum } from '@/types/admin/permistion';
import { PermissionErrorCard } from '@/components/shared/permission-error-card';
import { PermissionLoaderCard } from '@/components/shared/permission-loader-card';

const CategoriesPage = () => {
    // === check permissions ===
    const { hasPermission, isPermissionLoading } = useHasPermission({
        permissions: [PermissionEnum.PRODUCT_VIEW]
    });

    // === get all categories ===
    const { data, isLoading, isFetching } = useGetAllCategoriesQuery({
        page: 1,
        limit: 100
    });

    const categories = data?.data?.data;

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
                <h1 className='text-2xl font-medium'>All Main Categories</h1>

                <Button asChild className='ms-auto'>
                    <Link href='/admin/add-new-category'>Add new Category</Link>
                </Button>
            </div>
            {/* table */}
            <CategoriesTable
                categories={categories}
                isLoading={isLoading}
                isFetching={isFetching}
            />
        </div>
    );
};

export default CategoriesPage;
