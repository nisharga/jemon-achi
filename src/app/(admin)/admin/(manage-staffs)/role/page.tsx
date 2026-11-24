'use client';

import { Button } from '@/components/ui/admin-button';
import Link from 'next/link';
import React from 'react';
import { StaffsTable } from './_components/staffs-table';
import { useHasPermission } from '@/hooks/use-has-permission';
import { PermissionEnum } from '@/types/admin/permistion';
import { PermissionErrorCard } from '@/components/shared/permission-error-card';
import { PermissionLoaderCard } from '@/components/shared/permission-loader-card';
import { useGetAllRolesQuery } from '@/redux/admin/api/roles-api';

const StaffsPage = () => {
    // === check permissions ===
    const { hasPermission, isPermissionLoading } = useHasPermission({
        permissions: [PermissionEnum.USER_VIEW]
    });

    // === get all staffs ===
    const { data, isLoading, isFetching } = useGetAllRolesQuery({});
    const staffs = data?.data;

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
                <h1 className='text-2xl font-medium'>All Roles</h1>
                <Button asChild>
                    <Link href='/admin/add-new-role'>Add New Role </Link>
                </Button>
            </div>

            {/* table */}
            <StaffsTable
                staffs={staffs}
                isLoading={isLoading}
                isFetching={isFetching}
            />
        </section>
    );
};

export default StaffsPage;
