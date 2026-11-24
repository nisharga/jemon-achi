'use client';

import { Button } from '@/components/ui/admin-button';
import { useGetAllSubCategoriesQuery } from '@/redux/admin/api/subcategory-api';
import Link from 'next/link';
import React from 'react';
import { SubCategoriesTable } from './_components/sub-categories-table';
import { PermissionErrorCard } from '@/components/shared/permission-error-card';
import { PermissionLoaderCard } from '@/components/shared/permission-loader-card';
import { useHasPermission } from '@/hooks/use-has-permission';
import { PermissionEnum } from '@/types/admin/permistion';

const SubCategoriesPage = () => {
    // === check permissions ===
    const { hasPermission, isPermissionLoading } = useHasPermission({
        permissions: [PermissionEnum.PRODUCT_VIEW]
    });

    // === get all sub categories ===
    const { data, isLoading, isFetching } = useGetAllSubCategoriesQuery({
        page: 1,
        limit: 100
    });
    const subCategories = data?.data?.subcategories;

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
                <h1 className='text-2xl font-medium'>All Sub Categories</h1>

                <Button asChild className='ms-auto'>
                    <Link href='/admin/add-new-sub-category'>
                        Add new Sub Category
                    </Link>
                </Button>
            </div>
            {/* table */}
            <SubCategoriesTable
                subCategories={subCategories}
                isLoading={isLoading}
                isFetching={isFetching}
            />
        </div>
    );
};

export default SubCategoriesPage;
