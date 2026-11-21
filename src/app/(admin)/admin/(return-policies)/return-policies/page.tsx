'use client';

import { useGetAllReturnPoliciesQuery } from '@/redux/api-queries/return-policy-api';
import React from 'react';
import { ReturnPoliciesTable } from './_components/return-policies-table';
import { Button } from '@/components/ui/admin-button';
import Link from 'next/link';
import { useHasPermission } from '@/hooks/use-has-permission';
import { PermissionEnum } from '@/types/permistion';
import { PermissionErrorCard } from '@/components/shared/permission-error-card';
import { PermissionLoaderCard } from '@/components/shared/permission-loader-card';

const ReturnPoliciesPage = () => {
    // === check permissions ===
    const { hasPermission, isPermissionLoading } = useHasPermission({
        permissions: [PermissionEnum.PRODUCT_VIEW]
    });

    // === get all return policies ===
    const { data, isLoading, isFetching } = useGetAllReturnPoliciesQuery({
        page: 1,
        limit: 100
    });

    const returnPolicies = data?.data?.data;

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
                <h1 className='text-2xl font-medium'>All Return Policies</h1>

                <Button asChild className='ms-auto'>
                    <Link href='/admin/add-new-return-policy'>
                        Add Return Policy
                    </Link>
                </Button>
            </div>
            {/* table */}
            <ReturnPoliciesTable
                returnPolicies={returnPolicies}
                isLoading={isLoading}
                isFetching={isFetching}
            />
        </div>
    );
};

export default ReturnPoliciesPage;
